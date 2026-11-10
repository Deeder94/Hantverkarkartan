// Public Overture PMTiles transports. Local relay is restricted to localhost and
// forwards byte ranges to the documented public Overture S3 archive only.
export function isLocalServer(locationLike) {
  const hostname = String(locationLike?.hostname || '').toLowerCase();
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]';
}

export function releaseAgeDays(release, now = new Date()) {
  const match = /^(\d{4}-\d{2}-\d{2})\.\d+$/.exec(String(release));
  if (!match) return Infinity;
  const stamp = Date.parse(`${match[1]}T00:00:00Z`);
  return Number.isFinite(stamp) ? Math.floor((now.getTime() - stamp) / 86400000) : Infinity;
}

// Overture sparar offentliga utgåvor i högst 60 dagar. Stoppa redan föråldrade
// utgåvor innan vi provar nätverket. Det är ingen garanti att yngre filer finns.
export function eligibleOvertureReleases(config, now = new Date()) {
  return [...new Set([config.overtureRelease, ...(config.overtureFallbackReleases || [])])]
    .filter(release => releaseAgeDays(release, now) >= 0 && releaseAgeDays(release, now) < 60);
}

export function overtureSources(config, locationLike, release = config.overtureRelease) {
  if (![config.overtureRelease, ...(config.overtureFallbackReleases || [])].includes(release)) {
    throw new Error('OVERTURE_RELEASE_NOT_ALLOWLISTED');
  }
  const own=String(config.productionPlacesUrl||'');
  if(own){
    if(!/^\/[-a-zA-Z0-9_./]+\.pmtiles$/.test(own)||own.startsWith('//')||own.includes('..'))throw new Error('PRODUCTION_PLACES_URL_INVALID');
    return [{url:own,name:'Egen produktionskälla',release}];
  }
  const sources = [];
  const add = (url, name) => {
    if (url && !sources.some(s => s.url === url)) sources.push({url, name, release});
  };
  const s3 = `https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/${release}/places.pmtiles`;
  const cdn = `https://tiles.overturemaps.org/${release}/places.pmtiles`;
  add(s3, 'S3');
  if (isLocalServer(locationLike)) {
    add(`${locationLike.origin}/api/overture/${release}/places.pmtiles`, 'Lokal reservväg');
  }
  add(cdn, 'CDN');
  return sources;
}

export function describeOvertureFailure(error) {
  const nested = error instanceof AggregateError ? error.errors : [error];
  const messages = nested.map(x => String(x?.message || x)).filter(Boolean);
  const httpCodes = [...new Set(messages.flatMap(msg => [...msg.matchAll(/(?:HTTP\s*|status[: ]+|response code[: ]+)(4\d\d|5\d\d)/gi)].map(m => m[1])))];
  let cause = 'Extern datakälla eller avkodare kunde inte verifieras';
  if (httpCodes.length) cause = httpCodes.includes('404') ? `Overture-arkiv saknas (HTTP ${httpCodes.join('/')})` : `HTTP ${httpCodes.join('/')} från Overture`;
  else if (messages.some(msg => /fetch|network|cors|Failed to load|Load failed/i.test(msg))) cause = 'Nätverksfel/CORS mot Overture';
  else if (messages.some(msg => /decode|Pbf|VectorTile|tile-worker|MVT_/i.test(msg))) cause = 'Avkodningsfel för kartdata';
  else if (messages.some(msg => /timed?out|timeout/i.test(msg))) cause = 'Svarstiden överskreds';
  return {cause, detail: messages.map(msg => msg.replace(/https?:\/\/[^\s]+/g, '[publik källadress]').slice(0, 210)).join(' | ').slice(0, 700)};
}
