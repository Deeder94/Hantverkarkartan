import {
  CATEGORIES, mightMatchCategory, classifyPlaceDetailed, isUsablePlace,
  firstWebsite, sourceDatasets
} from './classifier.js';
import { mvtPointToLngLat } from './radius-search.js';

let parserPromise = null;

async function ensureParser() {
  if (!parserPromise) {
    parserPromise = Promise.all([
      import('https://cdn.jsdelivr.net/npm/pbf@5.1.2/+esm'),
      import('https://cdn.jsdelivr.net/npm/@mapbox/vector-tile@3.0.0/+esm')
    ]).then(([pbfModule, vectorTileModule]) => {
      const PbfReader = pbfModule.PbfReader;
      const VectorTile = vectorTileModule.VectorTile;
      if (typeof PbfReader !== 'function' || typeof VectorTile !== 'function') {
        throw new Error('MVT_DECODER_API');
      }
      return {PbfReader, VectorTile};
    }).catch(error => {
      parserPromise = null;
      throw error;
    });
  }
  return parserPromise;
}

function uniqueId(vectorFeature, props, coords) {
  const name = props['@name'] || props.name || '';
  return String(props.id || vectorFeature.id || `${coords[0]},${coords[1]}:${name}`);
}

function firstPoint(vectorFeature, tile) {
  const geometry = vectorFeature.loadGeometry();
  const point = geometry?.[0]?.[0];
  if (!point) return null;
  return mvtPointToLngLat(tile, point, vectorFeature.extent || 4096);
}

async function decodeTile(tile, buffer, minimumConfidence) {
  const {PbfReader, VectorTile} = await ensureParser();
  const vectorTile = new VectorTile(new PbfReader(buffer));
  const layer = vectorTile.layers?.place;
  if (!layer) return [];

  const candidates = [];
  for (let i = 0; i < layer.length; i++) {
    const vectorFeature = layer.feature(i);
    if (vectorFeature.type !== 1) continue;
    const props = vectorFeature.properties || {};
    if (!isUsablePlace(props, minimumConfidence)) continue;
    if (!mightMatchCategory(props)) continue;
    const classification = classifyPlaceDetailed(props);
    const categoryKey = classification?.key;
    if (!categoryKey) continue;

    const coords = firstPoint(vectorFeature, tile);
    if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) continue;
    const category = CATEGORIES[categoryKey];
    const id = uniqueId(vectorFeature, props, coords);
    const name = props['@name'] || props.name || props.basic_category || category.label;

    candidates.push({
      type: 'Feature', id,
      geometry: {type: 'Point', coordinates: coords},
      properties: {
        id,
        name,
        categoryKey,
        categoryLabel: category.label,
        categoryKeys: classification?.categoryKeys || [categoryKey],
        secondaryCategoryLabels: (classification?.secondaryCategories || []).map(item => item?.subcategoryLabel || item?.label || '').filter(Boolean),
        subcategoryKey: classification?.subcategoryKey || '',
        subcategoryLabel: classification?.subcategoryLabel || category.label,
        short: category.short,
        color: category.color,
        website: firstWebsite(props),
        sources: sourceDatasets(props).join(', '),
        overtureId: props.id || '',
        categoryBasis: classification?.basis || 'taxonomy',
        distanceMeters: null
      }
    });
  }
  return candidates;
}

self.onmessage = async (event) => {
  const message = event.data || {};
  if (message.type === 'warm') {
    try {
      await ensureParser();
      self.postMessage({type: 'ready'});
    } catch (error) {
      self.postMessage({type: 'warm-error', error: String(error?.message || error)});
    }
    return;
  }
  if (message.type !== 'decode') return;

  const id = message.id;
  try {
    const features = await decodeTile(message.tile, message.buffer, message.minimumConfidence);
    self.postMessage({type: 'decoded', id, features});
  } catch (error) {
    self.postMessage({type: 'decode-error', id, error: String(error?.message || error)});
  }
};
