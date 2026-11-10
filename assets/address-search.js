/** One-shot, explicitly submitted address lookup. Never autocomplete or infer a company location. */
const SWEDEN = {west: 10.2, south: 54.4, east: 25.5, north: 69.8};

export function addressChoiceFromPhoton(feature) {
  if (feature?.type !== 'Feature' || feature.geometry?.type !== 'Point') return null;
  const [lon, lat] = feature.geometry.coordinates || [];
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < SWEDEN.west || lon > SWEDEN.east || lat < SWEDEN.south || lat > SWEDEN.north) return null;
  const p = feature.properties || {};
  if (String(p.countrycode || '').toUpperCase() !== 'SE') return null;
  const parts = [
    [p.street, p.housenumber].filter(Boolean).join(' '),
    p.name && p.name !== p.street ? p.name : '',
    p.city || p.locality || p.county || p.state || '',
    p.postcode || ''
  ].map(value => String(value || '').trim()).filter(Boolean);
  const label = [...new Set(parts)].join(', ').slice(0, 200);
  if (!label) return null;
  return {label, coordinates: [lon, lat]};
}

export function parsePhotonCandidates(data) {
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('ADDRESS_INVALID_RESPONSE');
  const found = [];
  const used = new Set();
  for (const feature of data.features.slice(0, 20)) {
    const result = addressChoiceFromPhoton(feature);
    if (!result) continue;
    const key = result.coordinates.map(v => v.toFixed(6)).join(',');
    if (used.has(key)) continue;
    used.add(key);
    found.push(result);
    if (found.length === 5) break;
  }
  return found;
}

export async function fetchAddressChoices(query, { endpoint, signal, timeoutMs = 6500, fetchImpl = fetch } = {}) {
  const value = String(query ?? '').trim();
  if (value.length < 2 || value.length > 150) throw new Error('ADDRESS_INVALID_QUERY');
  const base = new URL(String(endpoint || ''));
  if (base.protocol !== 'https:') throw new Error('ADDRESS_INSECURE_ENDPOINT');
  base.searchParams.set('q', value);
  base.searchParams.set('lang', 'sv');
  base.searchParams.set('limit', '5');
  base.searchParams.set('bbox', '10.2,54.4,25.5,69.8');
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', onAbort, {once:true});
  const timer = setTimeout(() => controller.abort(), Math.max(1000, Math.min(15000, timeoutMs)));
  try {
    const response = await fetchImpl(base.toString(), {signal: controller.signal, headers:{Accept:'application/json'}, referrerPolicy:'no-referrer'});
    if (!response.ok) throw new Error(`ADDRESS_HTTP_${response.status}`);
    const data = await response.json();
    return parsePhotonCandidates(data);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
