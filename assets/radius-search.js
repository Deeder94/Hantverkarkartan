const EARTH_RADIUS_M = 6371008.8;
const textDecoder = new TextDecoder('utf-8');

export function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const toRad = Math.PI / 180;
  const p1 = lat1 * toRad;
  const p2 = lat2 * toRad;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function destinationPoint([lng, lat], distanceMeters, bearingDegrees) {
  const d = distanceMeters / EARTH_RADIUS_M;
  const brng = bearingDegrees * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinD = Math.sin(d);
  const cosD = Math.cos(d);
  const lat2 = Math.asin(sinLat1 * cosD + cosLat1 * sinD * Math.cos(brng));
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * sinD * cosLat1, cosD - sinLat1 * Math.sin(lat2));
  return [((lng2 * 180 / Math.PI + 540) % 360) - 180, lat2 * 180 / Math.PI];
}

export function circlePolygon(center, radiusMeters, steps = 96) {
  const ring = [];
  const count = Math.max(16, Math.floor(steps));
  for (let i = 0; i < count; i++) ring.push(destinationPoint(center, radiusMeters, (i / count) * 360));
  ring.push([...ring[0]]);
  return {
    type: 'Feature',
    properties: {kind: 'buffer', radiusMeters},
    geometry: {type: 'Polygon', coordinates: [ring]}
  };
}

export function bboxForRadius(center, radiusMeters) {
  const north = destinationPoint(center, radiusMeters, 0);
  const east = destinationPoint(center, radiusMeters, 90);
  const south = destinationPoint(center, radiusMeters, 180);
  const west = destinationPoint(center, radiusMeters, 270);
  return [west[0], south[1], east[0], north[1]];
}

function clampLat(lat) {
  return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

export function lngLatToTile(lng, lat, zoom) {
  const n = 2 ** zoom;
  const safeLat = clampLat(lat) * Math.PI / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(safeLat)) / Math.PI) / 2 * n);
  return [Math.max(0, Math.min(n - 1, x)), Math.max(0, Math.min(n - 1, y))];
}

export function tileCoordToLngLat(tileX, tileY, zoom) {
  const n = 2 ** zoom;
  const worldX = tileX / n;
  const worldY = tileY / n;
  const lng = worldX * 360 - 180;
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY))) * 180 / Math.PI;
  return [lng, lat];
}

export function tileRangeForRadius(center, radiusMeters, zoom = 14, maxTiles = 220) {
  const [west, south, east, north] = bboxForRadius(center, radiusMeters);
  const [xMinRaw, yMaxRaw] = lngLatToTile(west, south, zoom);
  const [xMaxRaw, yMinRaw] = lngLatToTile(east, north, zoom);
  const xMin = Math.min(xMinRaw, xMaxRaw);
  const xMax = Math.max(xMinRaw, xMaxRaw);
  const yMin = Math.min(yMinRaw, yMaxRaw);
  const yMax = Math.max(yMinRaw, yMaxRaw);
  const count = (xMax - xMin + 1) * (yMax - yMin + 1);
  if (count > maxTiles) {
    throw new Error(`Sökområdet kräver ${count} dataplattor, max är ${maxTiles}. Välj en mindre radie.`);
  }
  return {xMin, xMax, yMin, yMax, count, zoom};
}

function tileHalfDiagonalMeters(x, y, zoom) {
  const c = tileCoordToLngLat(x + 0.5, y + 0.5, zoom);
  const corners = [
    tileCoordToLngLat(x, y, zoom),
    tileCoordToLngLat(x + 1, y, zoom),
    tileCoordToLngLat(x, y + 1, zoom),
    tileCoordToLngLat(x + 1, y + 1, zoom)
  ];
  return Math.max(...corners.map(p => haversineMeters(c, p)));
}

/**
 * Returns only z/x/y tiles that can intersect the search circle, then orders
 * them from the search centre outwards. The conservative half-diagonal test
 * never drops a tile that can touch the circle but avoids corner tiles that
 * are guaranteed to be outside it.
 */
export function tilesForRadius(center, radiusMeters, zoom = 14, maxTiles = 220) {
  const range = tileRangeForRadius(center, radiusMeters, zoom, maxTiles);
  const tiles = [];
  for (let y = range.yMin; y <= range.yMax; y++) {
    for (let x = range.xMin; x <= range.xMax; x++) {
      const tileCenter = tileCoordToLngLat(x + 0.5, y + 0.5, zoom);
      const centerDistance = haversineMeters(center, tileCenter);
      const halfDiagonal = tileHalfDiagonalMeters(x, y, zoom);
      if (centerDistance <= radiusMeters + halfDiagonal) {
        tiles.push({z: zoom, x, y, centerDistance});
      }
    }
  }
  tiles.sort((a, b) => a.centerDistance - b.centerDistance);
  return tiles;
}

/**
 * Sökningar på 1–5 km behåller den beprövade 30s-gränsen.
 * Zoom 14 är nödvändigt för Places-data: 20 km kräver betydligt fler plattor.
 * Längre tidsbudget används ENDAST för större frivilliga sökningar.
 * En sökning som inte blir komplett måste fortfarande markeras ofullständig.
 */
export function deadlineForRadiusSearch(radiusMeters, tileCount, baseMs = 30000) {
  if (radiusMeters <= 5000) return baseMs;
  if (radiusMeters <= 10000) return Math.max(baseMs, 75000);
  return Math.max(baseMs, Math.min(180000, Math.max(120000, tileCount * 95)));
}

// PMTiles v3 tile ids use a Hilbert curve. These helpers let the search engine
// resolve many nearby tiles first and then coalesce their byte ranges into a
// handful of HTTP requests instead of issuing one Range request per tile.
const PMTILES_TZ_VALUES = [
  0, 1, 5, 21, 85, 341, 1365, 5461, 21845, 87381, 349525, 1398101,
  5592405, 22369621, 89478485, 357913941, 1431655765, 5726623061,
  22906492245, 91625968981, 366503875925, 1466015503701,
  5864062014805, 23456248059221, 93824992236885, 375299968947541,
  1501199875790165
];

function hilbertRotate(n, xy, rx, ry) {
  if (ry === 0) {
    if (rx === 1) {
      xy[0] = n - 1 - xy[0];
      xy[1] = n - 1 - xy[1];
    }
    const tmp = xy[0];
    xy[0] = xy[1];
    xy[1] = tmp;
  }
}

export function zxyToPmtilesTileId(z, x, y) {
  if (!Number.isInteger(z) || z < 0 || z > 26) throw new Error('Ogiltig PMTiles-zoom.');
  const n = 2 ** z;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= n || y >= n) {
    throw new Error('Ogiltig PMTiles-tilekoordinat.');
  }
  let rx = 0;
  let ry = 0;
  let d = 0;
  const xy = [x, y];
  for (let s = n / 2; s > 0; s /= 2) {
    rx = (xy[0] & s) > 0 ? 1 : 0;
    ry = (xy[1] & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    hilbertRotate(s, xy, rx, ry);
  }
  return PMTILES_TZ_VALUES[z] + d;
}

export function findPmtilesEntry(entries, tileId) {
  let low = 0;
  let high = entries.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const cmp = tileId - entries[mid].tileId;
    if (cmp > 0) low = mid + 1;
    else if (cmp < 0) high = mid - 1;
    else return entries[mid];
  }
  if (high >= 0) {
    const entry = entries[high];
    if (entry.runLength === 0) return entry;
    if (tileId - entry.tileId < entry.runLength) return entry;
  }
  return null;
}

/**
 * Merge nearby byte ranges while keeping a cap on over-fetch. Each item must
 * contain absolute `offset` and `length`. The returned group keeps the original
 * items so each compressed tile can be sliced out exactly before decompression.
 */
export function coalesceByteRanges(items, maxGapBytes = 98304, maxSpanBytes = 2097152) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.offset - b.offset || a.length - b.length);
  const groups = [];
  let group = null;

  for (const item of sorted) {
    const itemEnd = item.offset + item.length;
    if (!group) {
      group = {start: item.offset, end: itemEnd, items: [item]};
      continue;
    }
    const gap = Math.max(0, item.offset - group.end);
    const newEnd = Math.max(group.end, itemEnd);
    const newSpan = newEnd - group.start;
    if (gap <= maxGapBytes && newSpan <= maxSpanBytes) {
      group.end = newEnd;
      group.items.push(item);
    } else {
      groups.push({...group, length: group.end - group.start});
      group = {start: item.offset, end: itemEnd, items: [item]};
    }
  }
  if (group) groups.push({...group, length: group.end - group.start});
  return groups;
}

/**
 * Convert one MVT point coordinate inside a z/x/y tile to WGS84.
 * Avoids building a full GeoJSON object when only a point coordinate is needed.
 */
export function mvtPointToLngLat(tile, point, extent = 4096) {
  const z = Number(tile?.z);
  const x = Number(tile?.x);
  const y = Number(tile?.y);
  const px = Number(point?.x);
  const py = Number(point?.y);
  const ex = Number(extent) || 4096;
  if (![z, x, y, px, py, ex].every(Number.isFinite) || ex <= 0) return null;
  const n = 2 ** z;
  const worldX = (x + px / ex) / n;
  const worldY = (y + py / ex) / n;
  const lng = worldX * 360 - 180;
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY))) * 180 / Math.PI;
  return [lng, lat];
}
