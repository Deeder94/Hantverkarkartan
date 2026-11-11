import { CONFIG } from './config.js?v=r17.16';
import { overtureSources, eligibleOvertureReleases, describeOvertureFailure } from './overture-sources.js';
import {
  CATEGORIES, mightMatchCategory, classifyPlace, classifyPlaceDetailed, isUsablePlace, firstWebsite, bestAddress,
  sourceDatasets, statusLabel, safeJson
} from './classifier.js';
import {
  bboxForRadius, circlePolygon, haversineMeters, tilesForRadius, mvtPointToLngLat, deadlineForRadiusSearch
} from './radius-search.js';
import { fetchAddressChoices } from './address-search.js';

const $ = (sel) => document.querySelector(sel);
let maplibregl = null;

async function loadMapLibre() {
  if (maplibregl?.Map) return maplibregl;
  const sources = [
    'https://cdn.jsdelivr.net/npm/maplibre-gl@6.10.0/dist/maplibre-gl.mjs',
    'https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.mjs'
  ];
  let lastError = null;
  for (const url of sources) {
    try {
      const module = await import(url);
      if (module?.Map && module?.addProtocol) {
        maplibregl = module;
        return maplibregl;
      }
    } catch (error) {
      lastError = error;
      console.warn(`MapLibre kunde inte laddas från ${url}`, error);
    }
  }
  throw lastError || new Error('MAPLIBRE_LOAD_FAILED');
}
const state = {
  map: null,
  selectedCategories: new Set(Object.keys(CATEGORIES)),
  visibleFeatures: [],
  baseOvertureFeatures: [],
  featureById: new Map(),
  popup: null,
  selectedFeatureId: null,
  selectedDomMarker: null,
  addressLookup: { token: 0, controller: null, busy: false },
  pmtilesArchives: [],
  pmtilesHeaderPromises: [],
  pmtilesSelectionPromise: null,
  activeOvertureRelease: null,
  activeArchiveIndex: 0,
  mvtParserPromise: null,
  tileWorkerPool: null,
  tileWorkersDisabled: false,
  tileWorkerFallbackWarned: false,
  radiusTileCache: new Map(),
  radiusTilePromiseCache: new Map(),
  pmtilesSelectionFailed: false,
  pmtilesDirectoryCache: null,
  radiusSearch: {
    center: null,
    radiusMeters: 1000,
    deadlineMs: CONFIG.radiusSearchHardMaxMs,
    picking: false,
    busy: false,
    token: 0,
    partialErrors: 0,
    sourceError: null,
    timedOut: false,
    elapsedMs: null,
    incomplete: false,
    checkedTiles: 0,
    totalTiles: 0,
    abortController: null,
    prefetchController: null
  }
};

function text(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function setStatus(message, kind = 'info') {
  const el = $('#map-status');
  // An idle map needs no instruction banner. Keep real progress and errors visible.
  const value = String(message ?? '').trim();
  el.hidden = value.length === 0;
  el.textContent = value;
  el.dataset.kind = kind;
}

function formatRadius(meters) {
  return meters >= 1000 ? `${Number((meters / 1000).toFixed(1))} km` : `${Math.round(meters)} m`;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  return meters >= 1000 ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km` : `${Math.round(meters)} m`;
}

function entityTypeLabel(type) {
  return ({service:'Tjänsteföretag', retail:'Butik/handel', rental:'Uthyrning', consultant:'Konsult/besiktning'})[type] || '';
}

function fillStaticUi() {
  document.title = `${CONFIG.appName} – hitta hjälp för hus och fastighet`;
  document.querySelectorAll('[data-app-name]').forEach(el => el.textContent = CONFIG.appName);
  document.querySelectorAll('[data-release]').forEach(el => el.textContent = CONFIG.overtureRelease);
  document.querySelectorAll('[data-version]').forEach(el => el.textContent = CONFIG.appVersion);

  const operatorEls = document.querySelectorAll('[data-operator]');
  operatorEls.forEach(el => el.textContent = CONFIG.operator.name || 'Operatör ej konfigurerad');
  const emailEls = document.querySelectorAll('[data-contact-email]');
  emailEls.forEach(el => {
    if (CONFIG.operator.contactEmail) {
      el.textContent = CONFIG.operator.contactEmail;
      if (el.tagName === 'A') el.href = `mailto:${CONFIG.operator.contactEmail}`;
    } else {
      el.textContent = 'Kontaktuppgift saknas';
      if (el.tagName === 'A') el.removeAttribute('href');
    }
  });
}

function updateCategorySelectionLabel() {
  const label = $('#selected-category-label');
  const total = Object.keys(CATEGORIES).length;
  const selected = state.selectedCategories.size;
  if (label) label.textContent = selected === total ? '· alla valda' : selected === 0 ? '· inga valda' : `· ${selected} av ${total}`;
  const bulk = $('#toggle-all');
  if (bulk) {
    const all = selected === total;
    bulk.textContent = all ? 'Avmarkera alla' : 'Välj alla';
    bulk.setAttribute('aria-label', all ? 'Avmarkera alla kategorier' : 'Välj alla kategorier');
    bulk.dataset.allSelected = String(all);
  }
}

function buildCategoryControls() {
  const container = $('#category-list');
  for (const [key, category] of Object.entries(CATEGORIES)) {
    const label = document.createElement('label');
    label.className = 'category-chip';
    label.innerHTML = `
      <input type="checkbox" value="${text(key)}" checked>
      <span class="category-dot" style="--cat:${text(category.color)}">${text(category.short)}</span>
      <span>${text(category.label)}</span>`;
    label.querySelector('input').addEventListener('change', (event) => {
      if (event.target.checked) state.selectedCategories.add(key);
      else state.selectedCategories.delete(key);
      updateCategorySelectionLabel();
          applyCategoryFilter({refit: true});
    });
    container.append(label);
  }
  updateCategorySelectionLabel();
}



function setMobilePanelCollapsed(collapsed) {
  const panel = $('#sidebar');
  const toggle = $('#panel-toggle');
  panel.classList.toggle('is-collapsed', Boolean(collapsed));
  toggle.setAttribute('aria-expanded', String(!collapsed));
  toggle.setAttribute('aria-label', collapsed ? 'Visa sökpanelen' : 'Dölj sökpanelen');
  setTimeout(() => state.map?.resize(), 230);
}
function clearAllResultFilters() {
  $('#business-search').value = '';
  // The single multi-select category menu is authoritative for every filter.
  state.selectedCategories = new Set(Object.keys(CATEGORIES));
  document.querySelectorAll('#category-list input[type=checkbox]').forEach(input => {
    input.checked = true;
  });
  updateCategorySelectionLabel();
  applyCategoryFilter({refit: true});
}

async function selectOvertureArchive(directoryCache) {
    const releases = eligibleOvertureReleases(CONFIG);
    if(CONFIG.productionPlacesUrl)releases.splice(0,releases.length,CONFIG.overtureRelease);
    if (!releases.length) throw new Error('OVERTURE_RELEASE_EXPIRED: Uppdatera Overture-utgåvor i assets/config.js.');
    const failures = [];
    for (const release of releases) {
      const descriptors = overtureSources(CONFIG, window.location, release).map((source, index) => ({
        index, url: source.url, name: source.name, release,
        archive: new window.pmtiles.PMTiles(source.url, directoryCache)
      }));
      // Försök direkta S3/CDN först. Ett synkront PowerShell-relä får inte
      // gör snabb direkttransport prioriterad; reservvägen används vid behov.
      const probe = descriptor => {
        let timer;
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('OVERTURE_HEADER_TIMEOUT')), 10000);
        });
        return Promise.race([descriptor.archive.getHeader(), timeout])
          .then(header => ({descriptor, header}))
          .finally(() => clearTimeout(timer));
      };
      const direct = descriptors.filter(item => item.name !== 'Lokal reservväg');
      const probes = direct.map(probe);
      try {
        const first = await Promise.any(probes).catch(async remoteError => {
          const relay = descriptors.find(item => item.name === 'Lokal reservväg');
          if (!relay) throw remoteError;
          return probe(relay);
        });
        // All hedgade transportläsningar i detta söktillfälle använder samma release.
        state.pmtilesArchives = descriptors;
        state.pmtilesHeaderPromises = probes;
        state.activeArchiveIndex = first.descriptor.index;
        state.activeOvertureRelease = release;
        document.querySelectorAll('[data-release]').forEach(el => el.textContent = release);
        console.info('Overture Places utgåva vald:', release, first.descriptor.name);
        return release;
      } catch (error) {
        failures.push(`${release}: ${describeOvertureFailure(error).cause}`);
      }
    }
    throw new Error(`Inget tillgängligt Overture Places-arkiv (${failures.join('; ')}). Öppna overture-test.html.`);
}

function startOvertureSelection() {
  state.pmtilesSelectionFailed = false;
  state.pmtilesSelectionPromise = selectOvertureArchive(state.pmtilesDirectoryCache);
  // Register rejection handling: retries are user-initiated, not an infinite loop.
  state.pmtilesSelectionPromise.catch(error => {
    state.pmtilesSelectionFailed = true;
    console.warn('Overture Places:', error);
    if (!state.radiusSearch.busy) setStatus('Kunde inte ansluta till Overture Places. Prova en ny sökning.', 'error');
  });
}

function initMap() {
  if (!maplibregl?.Map || !maplibregl?.addProtocol) {
    setStatus('Kartmotorn MapLibre kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.', 'error');
    window.HK_BOOT?.fail?.('MapLibre kunde inte laddas.');
    return;
  }
  if (!window.pmtiles?.Protocol || !window.pmtiles?.PMTiles) {
    setStatus('PMTiles-klienten kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.', 'error');
    window.HK_BOOT?.fail?.('PMTiles kunde inte laddas.');
    return;
  }
  const protocol = new window.pmtiles.Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  // Use the documented public Overture S3 first, followed by a loopback-only
  // byte-range relay when local, and then the CDN as an additional fallback.
  // Never treat a partial dataset as a complete search.
  // Välj EN giltig dataversion innan vi startar några tilesökningar.
  // Fallback byter hela arkivet, aldrig version mitt under en sökning.
  state.pmtilesDirectoryCache = window.pmtiles.SharedPromiseCache
    ? new window.pmtiles.SharedPromiseCache(1024) : undefined;
  startOvertureSelection();
  const map = new maplibregl.Map({
    container: 'map',
    style: CONFIG.baseStyleUrl,
    center: CONFIG.initialView.center,
    zoom: CONFIG.initialView.zoom,
    maxBounds: CONFIG.swedenBounds,
    minZoom: 4,
    maxZoom: 19,
    attributionControl: false,
    hash: true
  });
  state.map = map;

  map.addControl(new maplibregl.NavigationControl({visualizePitch: true}), 'top-right');
  map.addControl(new maplibregl.AttributionControl({compact: true}), 'bottom-right');
  map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {enableHighAccuracy: false},
    trackUserLocation: false,
    showUserLocation: true,
    fitBoundsOptions: {maxZoom: 15}
  }), 'top-right');

  map.on('load', () => {
    $('#search-map-center').disabled = false;
    $('#address-submit').disabled = false;
    map.addSource('search-area', {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []}
    });
    map.addLayer({
      id: 'search-buffer-fill', type: 'fill', source: 'search-area',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {'fill-color': '#1d5c45', 'fill-opacity': 0.09}
    });
    map.addLayer({
      id: 'search-buffer-line', type: 'line', source: 'search-area',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {'line-color': '#1d5c45', 'line-width': 2.2, 'line-dasharray': [2, 1.5]}
    });
    map.addLayer({
      id: 'search-center-halo', type: 'circle', source: 'search-area',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {'circle-radius': 10, 'circle-color': '#ffffff', 'circle-stroke-width': 2, 'circle-stroke-color': '#1d5c45'}
    });
    map.addLayer({
      id: 'search-center', type: 'circle', source: 'search-area',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {'circle-radius': 5, 'circle-color': '#1d5c45'}
    });

    map.addSource('craft-places', {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []}
    });
    map.addLayer({
      id: 'craft-halo', type: 'circle', source: 'craft-places',
      paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'],14,13,18,18],
        'circle-color': '#ffffff', 'circle-opacity': 0.96,
        'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff'
      }
    });
    map.addLayer({
      id: 'craft-points', type: 'circle', source: 'craft-places',
      paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'],14,10,18,14],
        'circle-color': ['get','color'],
        'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff'
      }
    });
    map.addLayer({
      id: 'craft-labels', type: 'symbol', source: 'craft-places', minzoom: 14.3,
      layout: {
        'text-field': ['get','short'], 'text-size': 9, 'text-font': ['Noto Sans Bold'],
        'text-allow-overlap': true, 'text-ignore-placement': true
      },
      paint: {'text-color':'#ffffff'}
    });

    // The chosen business lives in a separate, topmost source. This is vital
    // when Overture records share the same coordinates: the exact selected
    // business is always distinguishable, regardless of the base pin overlap.
    map.addSource('selected-craft', {
      type: 'geojson', data: {type:'FeatureCollection', features:[]}
    });
    map.addLayer({
      id: 'selected-craft-glow', type:'circle', source:'selected-craft',
      paint: {'circle-radius':['interpolate',['linear'],['zoom'],12,21,18,29],
        'circle-color':'#f5c64c','circle-opacity':0.42,'circle-blur':0.32}
    });
    map.addLayer({
      id: 'selected-craft-ring', type:'circle', source:'selected-craft',
      paint: {'circle-radius':['interpolate',['linear'],['zoom'],12,17,18,23],
        'circle-color':'#ffffff','circle-stroke-color':'#b56c08','circle-stroke-width':3}
    });
    map.addLayer({
      id: 'selected-craft-core', type:'circle', source:'selected-craft',
      paint: {'circle-radius':['interpolate',['linear'],['zoom'],12,13,18,18],
        'circle-color':['get','color'],'circle-stroke-color':'#ffffff','circle-stroke-width':2}
    });
    map.addLayer({
      id: 'selected-craft-label', type:'symbol', source:'selected-craft',
      layout: {'text-field':['get','short'],'text-size':11,'text-font':['Noto Sans Bold'],
        'text-allow-overlap':true,'text-ignore-placement':true},
      paint: {'text-color':'#ffffff'}
    });

    ['craft-halo','craft-points','craft-labels','selected-craft-glow','selected-craft-ring','selected-craft-core','selected-craft-label'].forEach(layer => {
      map.on('click', layer, onProviderClick);
      map.on('mouseenter', layer, () => { if (!state.radiusSearch.picking) map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { if (!state.radiusSearch.picking) map.getCanvas().style.cursor = ''; });
    });

    map.on('click', onMapClick);
    setStatus('', 'info'); // Map ready: the main search button is the sole entry point.
    window.HK_BOOT?.mapReady?.();
    // Förvärm MVT-avkodaren efter att kartan är igång. Fel här får inte slå ut kartan;
    // sökfunktionen försöker igen vid nästa punkt-/radiesökning.
    warmTileWorkerPool();
  });

  map.on('error', (event) => {
    console.error('Kartfel:', event?.error || event);
    // Behåll kartan användbar vid enstaka tile-fel, men ge ett begripligt fel om
    // grundstilen aldrig kan laddas.
    if (!map.isStyleLoaded()) {
      setStatus('Baskartan kunde inte laddas korrekt. Kontrollera internetanslutningen och försök igen.', 'error');
    }
  });
}

function uniqueKey(feature, props) {
  return String(props.id || feature.id || `${feature.geometry?.coordinates?.join(',')}:${props['@name'] || ''}`);
}

function overtureAddressParts(properties = {}) {
  const addresses = safeJson(properties.addresses, []);
  const list = Array.isArray(addresses) ? addresses : [];
  const a = list.find(x => String(x?.country || '').toUpperCase() === 'SE') || list[0] || {};
  return {
    locality: String(a?.locality || a?.city || ''),
    postcode: String(a?.postcode || '').replace(/\s+/g, '')
  };
}

function normalizeFeature(feature, distanceFrom = null, knownClassification = null) {
  const props = feature.properties || {};
  if (!knownClassification && !isUsablePlace(props, CONFIG.minimumConfidence)) return null;
  const classification = knownClassification || classifyPlaceDetailed(props);
  const categoryKey = classification?.key;
  if (!categoryKey) return null;
  const geometry = feature.geometry;
  if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) return null;
  const [lng, lat] = geometry.coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  const category = CATEGORIES[categoryKey];
  const id = uniqueKey(feature, props);
  const name = props['@name'] || props.name || props.basic_category || category.label;
  const confidence = Number(props.confidence);
  const addressParts = overtureAddressParts(props);
  const distanceMeters = distanceFrom ? haversineMeters(distanceFrom, [lng, lat]) : null;
  return {
    type: 'Feature', id,
    geometry: {type: 'Point', coordinates: [lng, lat]},
    properties: {
      id, name, categoryKey, categoryLabel: category.label,
      categoryKeys: classification?.categoryKeys || [categoryKey],
      secondaryCategoryLabels: (classification?.secondaryCategories || []).map(item => item?.subcategoryLabel || item?.label || '').filter(Boolean),
      subcategoryKey: classification?.subcategoryKey || '',
      subcategoryLabel: classification?.subcategoryLabel || category.label,
      short: category.short, color: category.color,
      website: firstWebsite(props),
      phones: safeJson(props.phones, []), emails: safeJson(props.emails, []), socials: safeJson(props.socials, []),
      address: bestAddress(props), locality: addressParts.locality, postcode: addressParts.postcode, status: statusLabel(props),
      confidence: Number.isFinite(confidence) ? confidence : null,
      sources: sourceDatasets(props).join(', '),
      overtureId: props.id || '',
      categoryBasis: classification?.basis || 'taxonomy',
      categoryReason: classification?.reason || '',
      categoryScore: Number.isFinite(Number(classification?.score)) ? Number(classification.score) : null,
      categoryConfidence: classification?.categoryConfidence || '',
      entityType: classification?.entityType || '',
      distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null
    }
  };
}

function filteredFeatures() {
  const query = ($('#business-search').value || '').trim().toLocaleLowerCase('sv-SE');
  return state.visibleFeatures.filter(feature => {
    const p = feature.properties;
    const categoryKeys = Array.isArray(p.categoryKeys) ? p.categoryKeys : [p.categoryKey].filter(Boolean);
    if (!categoryKeys.some(key => state.selectedCategories.has(key))) return false;
    if (!query) return true;
    const secondary = Array.isArray(p.secondaryCategoryLabels) ? p.secondaryCategoryLabels.join(' ') : '';
    return `${p.name} ${p.categoryLabel} ${p.subcategoryLabel || ''} ${secondary} ${p.address}`.toLocaleLowerCase('sv-SE').includes(query);
  });
}

function refitFilteredResults() {
  // An explicit change of category or search text should not leave all matching
  // markers off screen after the user previously opened a distant company.
  if (!state.radiusSearch.center || state.radiusSearch.busy || !state.map?.getSource('search-area')) return;
  const matches = filteredFeatures();
  if (matches.length) fitToRadiusResults(matches);
  else fitToSearchArea();
}
function syncSelectedResultCards() {
  document.querySelectorAll('#results .result-card').forEach(button => {
    const selected = state.selectedFeatureId != null &&
      String(button.dataset.id) === state.selectedFeatureId;
    button.classList.toggle('is-map-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
// Keep the MapLibre source for desktop and click detection. On phones the
// selection is ALSO rendered as a DOM Marker above the WebGL canvas; the
// previously used canvas-only ring was missing on some physical Android GPUs.
function syncSelectedDomMarker(feature = null) {
  state.selectedDomMarker?.remove();
  state.selectedDomMarker = null;
  if (!feature || !state.map || !maplibregl?.Marker ||
      !window.matchMedia('(max-width:760px)').matches) return;
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2 ||
      !coords.every(Number.isFinite)) return;
  const properties = feature.properties || {};
  const node = document.createElement('div');
  node.className = 'hk-selected-map-marker';
  node.setAttribute('role', 'img');
  node.setAttribute('aria-label', `Valt företag: ${String(properties.name || 'Företag')}`);
  node.style.setProperty('--selected-marker-color', String(properties.color || '#1b694c'));
  const face = document.createElement('span');
  face.className = 'hk-selected-map-marker-face';
  face.textContent = String(properties.short || '•').slice(0, 3);
  node.append(face);
  // Do not intercept pointer events: tapping the underlying mapped company
  // must continue to work, including when multiple businesses overlap.
  node.style.pointerEvents = 'none';
  state.selectedDomMarker = new maplibregl.Marker({element:node, anchor:'center'})
    .setLngLat(coords).addTo(state.map);
}
function clearCompanySelection() {
  state.selectedFeatureId = null;
  state.map?.getSource('selected-craft')?.setData({type:'FeatureCollection',features:[]});
  syncSelectedDomMarker();
  syncSelectedResultCards();
}
function chooseCompany(feature) {
  const id = String(feature?.id ?? '');
  if (!id) return;
  state.selectedFeatureId = id;
  state.map?.getSource('selected-craft')?.setData({type:'FeatureCollection',features:[feature]});
  syncSelectedDomMarker(feature);
  syncSelectedResultCards();
}
function closeCompanyPopup() {
  state.popup?.remove();
  state.popup = null;
  clearCompanySelection();
}
function applyCategoryFilter({refit = false} = {}) {
  state.resultLimit = 40;
  const filtered = filteredFeatures();
  if (state.selectedFeatureId != null &&
      !filtered.some(feature => String(feature.id) === state.selectedFeatureId)) {
    closeCompanyPopup();
  }
  updateGeoJson(filtered);
  updateResultList(filtered);
  if (refit) refitFilteredResults();
}

function updateGeoJson(features) {
  const source = state.map?.getSource('craft-places');
  if (source) source.setData({type:'FeatureCollection', features});
}

function updateResultList(features = filteredFeatures()) {
  const list = $('#results');
  const more = $('#more-results');
  const count = $('#result-count');
  const reset = $('#reset-filters');
  const feedback = $('#result-feedback');
  const retry = $('#retry-results');
  if (reset) reset.hidden = !$('#business-search').value.trim() && state.selectedCategories.size === Object.keys(CATEGORIES).length;
  const inRadius = Boolean(state.radiusSearch.center);
  const incomplete = Boolean(state.radiusSearch.incomplete);
  const failed = !state.radiusSearch.busy && inRadius &&
    (state.radiusSearch.partialErrors > 0 || state.radiusSearch.timedOut || incomplete);
  // Never overwrite the results heading via textContent: it can contain
  // the result count element. r17.3 introduced exactly that regression.
  // Keep the heading static and update only its count.
  if (count) count.textContent = String(features.length);
  const allCount = $('#result-total');
  if (allCount) {
    const shown = Math.min(features.length, Math.max(40, state.resultLimit || 40));
    allCount.textContent = state.radiusSearch.center && !state.radiusSearch.busy
      ? (features.length ? `Visar ${shown} av ${features.length} träffar · närmast först`
        : (failed ? 'Sökningen kunde inte slutföras' : (state.visibleFeatures.length ? 'Inga träffar med dina filter' : 'Inga träffar hittades')))
      : 'Sorterade efter avstånd';
  }
  list.replaceChildren();
  if (more) more.hidden = true;
  if (feedback) {
    feedback.hidden = !failed;
    if (failed) {
      const n = state.radiusSearch.checkedTiles || 0;
      const total = state.radiusSearch.totalTiles || 0;
      const coverage = total ? `${n} av ${total} dataplattor kunde kontrolleras` : 'Overture-data kunde inte hämtas';
      feedback.textContent = `Ofullständigt sökresultat – ${coverage}. Träffarna nedan är inte hela urvalet.`;
    }
  }
  if (retry) retry.hidden = !failed;
  const diagnostic = $('#result-diagnostics');
  if (diagnostic) {
    diagnostic.hidden = !failed;
    if (!failed) diagnostic.open = false;
    const detail = $('#result-diagnostics-text');
    if (detail) detail.textContent = failed
      ? `Källa: Overture Places. ${state.radiusSearch.sourceError?.cause || (state.radiusSearch.timedOut ? 'För lång svarstid' : 'Alla dataplattor kunde inte kontrolleras')}. Testa att söka igen. Saknade data betyder inte att företag saknas.`
      : '';
  }

  if (state.radiusSearch.busy) {
    list.innerHTML = `<li class="empty loading-row">Söker inom ${text(formatRadius(state.radiusSearch.radiusMeters))}…</li>`;
    return;
  }

  if (!inRadius) {
    list.innerHTML = '<li class="empty">Inga sökresultat ännu. Välj en punkt i kartan ovan för att börja.</li>';
    return;
  }

  if (!features.length) {
    if (state.selectedCategories.size === 0) {
      list.innerHTML = '<li class="empty">Inga kategorier valda. Välj minst en kategori ovanför för att visa företag.</li>';
      setStatus('Välj minst en kategori för att visa företag i området.', 'info');
      return;
    }
    const elapsed = Number.isFinite(state.radiusSearch.elapsedMs) ? ` · ${(state.radiusSearch.elapsedMs / 1000).toFixed(1)} s` : '';
    if (state.radiusSearch.timedOut) {
      list.innerHTML = `<li class="empty">Sökningen tog för lång tid. Inga bekräftade träffar ännu. Tryck Försök igen för att fortsätta hämta information.</li>`;
      setStatus(`Fullständig sökning kunde inte slutföras inom ${Math.round((state.radiusSearch.deadlineMs || CONFIG.radiusSearchHardMaxMs) / 1000)} s${elapsed}. Försök med mindre radie för ditt område.`, 'error');
    } else if (state.radiusSearch.partialErrors > 0) {
      const cause = state.radiusSearch.sourceError?.cause || 'Extern datakälla svarade inte korrekt';
      list.innerHTML = '<li class="empty">Företagsuppgifterna gick inte att hämta just nu. Prova Försök igen. Detta betyder inte att det saknas företag i området.</li>'; 
      setStatus('Sökningen kunde inte slutföras. Prova igen eller välj ett mindre område.', 'error');
    } else {
      list.innerHTML = `<li class="empty">Inga matchande företag hittades inom ${text(formatRadius(state.radiusSearch.radiusMeters))}. Prova större radie eller andra kategorier.</li>`;
      setStatus(`Ingen relevant träff inom ${formatRadius(state.radiusSearch.radiusMeters)}${elapsed} med valda filter.`, 'info');
    }
    return;
  }

  const center = state.radiusSearch.center;
  const sorted = [...features].sort((a,b) => {
    const da = Number.isFinite(a.properties.distanceMeters) ? a.properties.distanceMeters : haversineMeters(center, a.geometry.coordinates);
    const db = Number.isFinite(b.properties.distanceMeters) ? b.properties.distanceMeters : haversineMeters(center, b.geometry.coordinates);
    return da - db;
  });

  const fragment = document.createDocumentFragment();
  const visibleLimit = Math.min(sorted.length, Math.max(40, state.resultLimit || 40));
  if (more && sorted.length > visibleLimit) {
    more.hidden = false;
    more.textContent = `Visa fler företag (${visibleLimit} av ${sorted.length})`;
  }
  for (const feature of sorted.slice(0, visibleLimit)) {
    const p = feature.properties;
    const distance = Number.isFinite(p.distanceMeters) ? ` · ${formatDistance(p.distanceMeters)}` : '';
    const li = document.createElement('li');
    li.innerHTML = `
      <button class="result-card${state.selectedFeatureId === String(feature.id) ? ' is-map-selected' : ''}" data-id="${text(feature.id)}" aria-pressed="${String(state.selectedFeatureId === String(feature.id))}" aria-label="Visa ${text(p.name)} på kartan">
        <span class="result-symbol" style="--cat:${text(p.color)}">${text(p.short)}</span>
        <span class="result-copy"><strong>${text(p.name)}</strong><small class="result-meta">${text(p.subcategoryLabel || p.categoryLabel)}${distance ? `<span class="result-distance">${text(distance.replace(' · ', ''))}</span>` : ''}</small>${p.address ? `<small class="result-address">${text(p.address)}</small>` : ''}</span>
        <span class="result-chevron" aria-hidden="true">›</span>
      </button>`;
    fragment.append(li);
  }
  list.append(fragment);

  const elapsed = Number.isFinite(state.radiusSearch.elapsedMs) ? ` · ${(state.radiusSearch.elapsedMs / 1000).toFixed(1)} s` : '';
  setStatus(incomplete
    ? `${features.length} bekräftade träffar från delvis hämtad data. Sökningen är ofullständig – försök igen.`
    : `${features.length} företag inom ${formatRadius(state.radiusSearch.radiusMeters)}${elapsed}.`,
    incomplete ? 'warning' : 'ok');
}
function focusFeature(feature) {
  if (window.matchMedia('(max-width:760px)').matches) setMobilePanelCollapsed(true);
  const mobile = window.matchMedia('(max-width:760px)').matches;
  state.map.easeTo({center: feature.geometry.coordinates,
    zoom: Math.max(state.map.getZoom(), 16),
    ...(mobile ? {offset:[0,-Math.min(95,window.innerHeight * 0.11)]} : {}), duration:500});
  showPopup(feature, feature.geometry.coordinates);
}

// Several painted layers share the same hit area. Handle only once per click,
// otherwise repeated popup creation could clear and reapply the selection.
const handledProviderClicks = new WeakSet();
function onProviderClick(event) {
  if (state.radiusSearch.picking) return;
  const nativeEvent = event.originalEvent;
  if (nativeEvent && handledProviderClicks.has(nativeEvent)) return;
  const topmost = state.map?.queryRenderedFeatures?.(event.point, {
    layers:['selected-craft-label','selected-craft-core','selected-craft-ring',
      'selected-craft-glow','craft-labels','craft-points','craft-halo']
  });
  const rendered = topmost?.[0] || event.features?.[0];
  if (!rendered) return;
  const id = String(rendered.properties?.id || rendered.id || '');
  const feature = state.featureById.get(id);
  if (!feature) return;
  if (nativeEvent) handledProviderClicks.add(nativeEvent);
  if (window.matchMedia('(max-width:760px)').matches) {
    state.map.easeTo({center:feature.geometry.coordinates,
      offset:[0,-Math.min(95,window.innerHeight * 0.11)],duration:380});
  }
  showPopup(feature, feature.geometry.coordinates);
}

function safeWebsiteUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function firstSafeTelephone(raw) {
  const list = Array.isArray(raw) ? raw : safeJson(raw, []);
  const entries = Array.isArray(list) ? list : [list];
  for (const entry of entries) {
    const value = String(entry?.number || entry?.phone || entry || '').trim();
    if (/^\+?[0-9() .-]{6,24}$/.test(value) && value.replace(/\D/g, '').length >= 6) {
      return {display: value, link: value.replace(/[^0-9+]/g, '')};
    }
  }
  return null;
}
function firstSafeEmail(raw) {
  const list = Array.isArray(raw) ? raw : safeJson(raw, []);
  const entries = Array.isArray(list) ? list : [list];
  return entries.map(v => String(v?.email || v || '').trim())
    .find(v => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v) && v.length <= 180) || '';
}
function firstSafeSocial(raw) {
  const list = Array.isArray(raw) ? raw : safeJson(raw, []);
  const entries = Array.isArray(list) ? list : [list];
  return entries.map(v => safeWebsiteUrl(v?.url || v)).find(Boolean) || '';
}
function showPopup(feature, lngLat) {
  const p = feature.properties || {};
  const website = safeWebsiteUrl(p.website);
  const phone = firstSafeTelephone(p.phones);
  const email = firstSafeEmail(p.emails);
  const social = firstSafeSocial(p.socials);
  const distance = Number.isFinite(p.distanceMeters) ? formatDistance(p.distanceMeters) : '';
  const coordinates = feature.geometry?.coordinates || [];
  const mapLink = Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coordinates[1]},${coordinates[0]}`)}` : '';
  const secondary = Array.isArray(p.secondaryCategoryLabels)
    ? [...new Set(p.secondaryCategoryLabels)].filter(Boolean).filter(x => x !== p.subcategoryLabel).slice(0,4) : [];
  const categoryBasis = p.categoryBasis === 'profile' ? 'företagsprofil och kategori'
    : p.categoryBasis === 'name' ? 'företagsnamn och kategori' : 'Overtures kategorier';
  const extraLinks = [
    phone ? `<a class="popup-link-item" href="tel:${text(phone.link)}">Ring: ${text(phone.display)}</a>` : '',
    email ? `<a class="popup-link-item" href="mailto:${text(email)}">E-post: ${text(email)}</a>` : '',
    mapLink ? `<a class="popup-link-item" href="${text(mapLink)}" target="_blank" rel="noopener noreferrer">Visa platsen i karttjänst ↗</a>` : '',
    social ? `<a class="popup-link-item" href="${text(social)}" target="_blank" rel="noopener noreferrer nofollow">Sociala medier ↗</a>` : ''
  ].filter(Boolean).join('');
  const sourceInfo = `<p>Företagsuppgifter från Overture Places ${text(state.activeOvertureRelease || CONFIG.overtureRelease)}.</p>
    ${p.sources ? `<p>Underliggande källor: ${text(p.sources)}.</p>` : ''}
    <p>Kategorisering: ${text(categoryBasis)}. Värden från källdatan är inte kontrollerade av Hantverkarkartan.</p>
    ${Number.isFinite(p.confidence) ? `<p>Existenssignal i källdatan: ${text(Math.round(p.confidence * 100))}/100. Detta är inte ett kundbetyg, en tjänstekontroll eller en garanti.</p>` : ''}
    <a href="${text(CONFIG.overturePlacesDocsUrl)}" target="_blank" rel="noopener noreferrer">Om Overture Places ↗</a>
    <a href="${text(CONFIG.reportIssueUrl)}" target="_blank" rel="noopener noreferrer">Rapportera datafel ↗</a>`;
  const html = `
    <article class="popup-card">
      <div class="popup-mobile-head"><span class="popup-mobile-grip" aria-hidden="true"></span></div>
      <div class="popup-kicker">${text(p.categoryLabel || 'Företag')}</div>
      <h2>${text(p.name)}</h2>
      <div class="popup-mobile-summary">
        <div class="popup-mobile-service">${text(p.subcategoryLabel || p.categoryLabel || 'Ej specificerad')}</div>
        <div class="popup-mobile-meta"><span>${p.address ? text(p.address) : 'Adress saknas'}</span>${distance ? `<strong>${text(distance)} bort</strong>` : ''}</div>
      </div>
      <button class="popup-more-toggle" type="button" aria-expanded="false">Visa fler uppgifter <span aria-hidden="true">⌄</span></button>
      <div class="popup-scroll">
      <div class="popup-overview">
        <div class="popup-key-info"><span>Typ av verksamhet</span><strong>${text(p.subcategoryLabel || p.categoryLabel || 'Ej specificerad')}</strong></div>
        ${p.entityType ? `<div class="popup-key-info"><span>Inriktning</span><strong>${text(entityTypeLabel(p.entityType))}</strong></div>` : ''}
        <div class="popup-key-info"><span>Adress enligt Overture</span><strong>${p.address ? text(p.address) : 'Gatuadress saknas i källdatan'}</strong></div>
        ${distance ? `<div class="popup-key-info"><span>Fågelvägsavstånd</span><strong>${text(distance)} från sökpunkten</strong></div>` : ''}
        <div class="popup-key-info"><span>Status i källdatan</span><strong>${p.status && p.status !== 'Verksamhetsstatus saknas' ? `${text(p.status)} (ej livekontrollerat)` : 'Ej tillgänglig – kontrollera själv'}</strong></div>
      </div>
      ${secondary.length ? `<p class="popup-secondary"><strong>Andra relevanta områden:</strong> ${secondary.map(text).join(' · ')}</p>` : ''}
      <div class="popup-actions popup-actions-desktop">${website
        ? `<a href="${text(website)}" target="_blank" rel="noopener noreferrer nofollow" title="Extern webbplats från Overture, ej kontrollerad">Besök webbplats ↗</a>`
        : (mapLink ? `<a href="${text(mapLink)}" target="_blank" rel="noopener noreferrer">Visa på karta ↗</a>` : '<span class="popup-no-site">Ingen webbplats angiven</span>')}</div>
      ${extraLinks ? `<div class="popup-contact">${extraLinks}</div>` : ''}
      <p class="popup-hint"><strong>Att tänka på:</strong> detta är en kartträff, inte en rekommendation eller kvalitetskontroll. Kontrollera tjänster, behörigheter, försäkring och kontaktuppgifter före beställning.</p>
      <p class="popup-source-line"><strong>Källa: Overture Maps Places.</strong> Hantverkarkartan visar uppgifterna utan egen företagsgranskning. <a href="${text(CONFIG.reportIssueUrl)}" target="_blank" rel="noopener noreferrer">Rapportera fel till Overture ↗</a></p>
      <details><summary>Mer om datakällan och urvalet</summary>${sourceInfo}</details>
      </div>
      <div class="popup-actions popup-actions-mobile">${website
        ? `<a href="${text(website)}" target="_blank" rel="noopener noreferrer nofollow" title="Extern webbplats från Overture, ej kontrollerad">Besök webbplats ↗</a>`
        : (mapLink ? `<a href="${text(mapLink)}" target="_blank" rel="noopener noreferrer">Visa på karta ↗</a>` : '<span class="popup-no-site">Ingen webbplats angiven</span>')}</div>
    </article>`;
  // Mobile: keep the company card OUTSIDE the MapLibre map canvas. An anchored
  // popup was clipped by the map/sidebar stacking contexts on real Android.
  // Desktop retains its existing MapLibre popup behavior.
  state.popup?.remove();
  state.popup = null;
  chooseCompany(feature);
  if (window.matchMedia('(max-width:760px)').matches) {
    setMobilePanelCollapsed(true);
    const overlay = document.createElement('section');
    overlay.className = 'mobile-company-overlay';
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', `Företagsinformation: ${String(p.name || 'Företag')}`);
    overlay.innerHTML = `<button type="button" class="mobile-company-close" aria-label="Stäng företagsinformation">×</button>${html}`;
    document.body.append(overlay);
    const close = () => {
      overlay.remove();
      if (state.popup?.remove === close) {
        state.popup = null;
        clearCompanySelection();
      }
    };
    state.popup = {remove: close};
    overlay.querySelector('.mobile-company-close').addEventListener('click', close);
    const more = overlay.querySelector('.popup-more-toggle');
    more.addEventListener('click', () => {
      const expanded = overlay.querySelector('.popup-card').classList.toggle('is-expanded');
      more.setAttribute('aria-expanded', String(expanded));
      more.innerHTML = expanded ? 'Visa färre uppgifter <span aria-hidden="true">⌃</span>' : 'Visa fler uppgifter <span aria-hidden="true">⌄</span>';
    });
    return;
  }
  const popup = new maplibregl.Popup({closeButton:true, maxWidth:'400px', offset:14})
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(state.map);
  state.popup = popup;
  popup.on?.('close', () => {
    if (state.popup === popup) {
      state.popup = null;
      clearCompanySelection();
    }
  });
}

function searchPadding() {
  const desktop = window.matchMedia('(min-width: 761px)').matches;
  if (!desktop) return {top: 70, right: 45, bottom: 210, left: 45};
  // Desktopkartan ligger redan bredvid sidopanelen. r2 räknade in panelbredden
  // en gång till här, vilket gav onödigt utzoomade och förskjutna sökresultat.
  return {top: 58, right: 58, bottom: 58, left: 58};
}

function updateSearchArea() {
  const source = state.map?.getSource('search-area');
  if (!source) return;
  if (!state.radiusSearch.center) {
    source.setData({type:'FeatureCollection', features:[]});
    return;
  }
  source.setData({
    type: 'FeatureCollection',
    features: [
      circlePolygon(state.radiusSearch.center, state.radiusSearch.radiusMeters),
      {type:'Feature', properties:{kind:'center'}, geometry:{type:'Point', coordinates:state.radiusSearch.center}}
    ]
  });
}

function fitToSearchArea() {
  if (!state.radiusSearch.center) return;
  const [west, south, east, north] = bboxForRadius(state.radiusSearch.center, state.radiusSearch.radiusMeters);
  state.map.fitBounds([[west, south], [east, north]], {padding: searchPadding(), duration: 500, maxZoom: 16});
}

function fitToRadiusResults(features) {
  if (!features.length) return;
  if (features.length === 1) {
    // Preserve geographic context for a single hit instead of zooming so far
    // that the original search point and other map reference points disappear.
    fitToSearchArea();
    return;
  }
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const feature of features) {
    const [lng, lat] = feature.geometry.coordinates;
    west = Math.min(west, lng); east = Math.max(east, lng);
    south = Math.min(south, lat); north = Math.max(north, lat);
  }
  state.map.fitBounds([[west, south], [east, north]], {padding: searchPadding(), duration: 550, maxZoom: 15.5});
}

function beginPointPicking() {
  if (!state.map) return;
  closeCompanyPopup();
  if (window.matchMedia('(max-width:760px)').matches) {
    window.hkAutoCollapsedForPick = !$('#sidebar').classList.contains('is-collapsed');
    setMobilePanelCollapsed(true);
  }
  state.radiusSearch.picking = true;
  $('#map-instruction').hidden = false;
  const button = $('#search-map-center');
  button.innerHTML = '<span aria-hidden="true">×</span> Avbryt platsval';
  button.setAttribute('aria-pressed', 'true');
  button.classList.add('is-active');
  $('#radius-help').textContent = 'Klicka på valfri punkt i kartan. Sökningen startar automatiskt.';
  state.map.getCanvas().style.cursor = 'crosshair';
  setStatus('', 'info'); // During picking, #map-instruction already gives the next action.
  // Intent-based warm-up: only after the user explicitly enters point-search
  // mode. This never displays businesses and is not triggered by pan/zoom.
  prefetchPointSearchArea().catch(() => {});
}

function cancelPointPicking(abortPrefetch = true) {
  if (abortPrefetch) {
    state.radiusSearch.prefetchController?.abort();
    state.radiusSearch.prefetchController = null;
  }
  state.radiusSearch.picking = false;
  $('#map-instruction').hidden = true;
  if (window.hkAutoCollapsedForPick) {
    setMobilePanelCollapsed(false);
    window.hkAutoCollapsedForPick = false;
  }
  const button = $('#search-map-center');
  button.innerHTML = '<span aria-hidden="true">⌖</span> ' + (state.radiusSearch.center ? 'Sök från ny plats' : 'Sök på kartan');
  button.setAttribute('aria-pressed', 'false');
  button.classList.remove('is-active');
  if (state.map) state.map.getCanvas().style.cursor = '';
}

function onMapClick(event) {
  if (!state.radiusSearch.picking) return;
  // Keep intent-prefetch requests alive: exact tile promises are shared with
  // the committed search, avoiding duplicate network work after the click.
  cancelPointPicking(false);
  setRadiusSearchPoint([event.lngLat.lng, event.lngLat.lat]);
}

function setRadiusSearchPoint(center) {
  closeCompanyPopup();
  state.radiusSearch.center = center;
  state.radiusSearch.partialErrors = 0;
  state.radiusSearch.sourceError = null;
  state.radiusSearch.timedOut = false;
  state.radiusSearch.elapsedMs = null;
  state.radiusSearch.deadlineMs = CONFIG.radiusSearchHardMaxMs;
  $('#clear-radius-search').hidden = false;
  $('#show-search-area').hidden = false;
  $('#radius-help').textContent = `Söker inom ${formatRadius(state.radiusSearch.radiusMeters)} från vald punkt. Välj ny plats för att söka någon annanstans.`;
  updateSearchArea();
  fitToSearchArea();
  runRadiusSearch();
}

function clearRadiusSearch() {
  closeCompanyPopup();
  state.radiusSearch.abortController?.abort();
  state.radiusSearch.abortController = null;
  state.radiusSearch.prefetchController?.abort();
  state.radiusSearch.prefetchController = null;
  state.radiusSearch.token += 1;
  state.baseOvertureFeatures = [];
  state.radiusSearch.center = null;
  state.radiusSearch.busy = false;
  state.radiusSearch.partialErrors = 0;
  state.radiusSearch.sourceError = null;
  state.radiusSearch.timedOut = false;
  state.radiusSearch.elapsedMs = null;
  state.radiusSearch.deadlineMs = CONFIG.radiusSearchHardMaxMs;
  state.radiusSearch.incomplete = false;
  state.radiusSearch.checkedTiles = 0;
  state.radiusSearch.totalTiles = 0;
  $('#sidebar')?.classList.remove('has-search', 'has-results');
  cancelPointPicking();
  $('#clear-radius-search').hidden = true;
  $('#show-search-area').hidden = true;
  $('#radius-help').textContent = 'Tryck på knappen och välj en punkt i kartan. Sökningen startar direkt.';
  updateSearchArea();
  state.visibleFeatures = [];
  state.featureById.clear();
  $('#sidebar')?.classList.remove('has-results');
  updateGeoJson([]);
  updateResultList([]);
  setStatus('', 'info'); // After clearing a search, avoid a duplicate idle instruction.
}

async function ensureMvtParser() {
  if (!state.mvtParserPromise) {
    state.mvtParserPromise = Promise.all([
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
      state.mvtParserPromise = null;
      throw error;
    });
  }
  return state.mvtParserPromise;
}

function remainingMs(deadline) {
  return Math.max(0, deadline - performance.now());
}

function promiseBeforeDeadline(promise, deadline) {
  const remaining = remainingMs(deadline);
  if (remaining <= 0) return Promise.reject(new Error('SEARCH_HARD_TIMEOUT'));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SEARCH_HARD_TIMEOUT')), remaining);
    Promise.resolve(promise).then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); }
    );
  });
}


function tileWorkerCount() {
  const hardware = Math.max(2, Number(globalThis.navigator?.hardwareConcurrency) || 4);
  return Math.max(2, Math.min(CONFIG.radiusSearchWorkerMax, hardware - 1));
}

function resetTileWorkerPool({disable = false} = {}) {
  const pool = state.tileWorkerPool;
  if (pool?.clients) {
    for (const client of pool.clients) {
      try { client.worker.terminate(); } catch { /* noop */ }
      if (client.job) client.job.reject(new Error('TILE_WORKER_RESET'));
    }
    for (const job of pool.queue || []) job.reject(new Error('TILE_WORKER_RESET'));
  }
  state.tileWorkerPool = null;
  if (disable) state.tileWorkersDisabled = true;
}

function pumpTileWorkerPool() {
  const pool = state.tileWorkerPool;
  if (!pool || pool.disabled) return;
  for (const client of pool.clients) {
    if (client.dead || client.busy) continue;
    while (pool.queue.length) {
      const job = pool.queue.shift();
      if (job.deadline <= performance.now()) {
        job.reject(new Error('SEARCH_HARD_TIMEOUT'));
        continue;
      }
      client.busy = true;
      client.job = job;
      try {
        client.worker.postMessage({
          type: 'decode', id: job.id, tile: job.tile, buffer: job.buffer,
          minimumConfidence: CONFIG.minimumConfidence
        }, [job.buffer]);
      } catch (error) {
        client.busy = false;
        client.job = null;
        job.reject(error);
        continue;
      }
      break;
    }
  }
}

function ensureTileWorkerPool() {
  if (state.tileWorkersDisabled || typeof Worker !== 'function') return null;
  if (state.tileWorkerPool) return state.tileWorkerPool;

  const pool = {clients: [], queue: [], nextId: 1, disabled: false};
  const workerUrl = new URL('./tile-worker.js', import.meta.url);
  const count = tileWorkerCount();
  for (let i = 0; i < count; i++) {
    try {
      const worker = new Worker(workerUrl, {type: 'module', name: `hk-tile-${i + 1}`});
      const client = {worker, busy: false, dead: false, job: null};
      worker.onmessage = (event) => {
        const message = event.data || {};
        if (message.type === 'ready') {
          client.ready = true;
          pumpTileWorkerPool();
          return;
        }
        if (message.type === 'warm-error') {
          console.warn('Tile-worker kunde inte ladda MVT-avkodaren.', message.error);
          client.dead = true;
          try { worker.terminate(); } catch { /* noop */ }
          if (pool.clients.every(item => item.dead)) {
            pool.disabled = true;
            state.tileWorkersDisabled = true;
            while (pool.queue.length) pool.queue.shift().reject(new Error('TILE_WORKER_FAILED'));
          }
          pumpTileWorkerPool();
          return;
        }
        const job = client.job;
        if (!job || message.id !== job.id) return;
        client.busy = false;
        client.job = null;
        if (message.type === 'decoded') job.resolve(message.features || []);
        else job.reject(new Error(message.error || 'TILE_WORKER_DECODE_FAILED'));
        pumpTileWorkerPool();
      };
      worker.onerror = (event) => {
        const job = client.job;
        client.busy = false;
        client.job = null;
        client.dead = true;
        try { worker.terminate(); } catch { /* noop */ }
        if (job) job.reject(new Error(event?.message || 'TILE_WORKER_FAILED'));
        if (pool.clients.every(item => item.dead)) {
          pool.disabled = true;
          state.tileWorkersDisabled = true;
          while (pool.queue.length) pool.queue.shift().reject(new Error('TILE_WORKER_FAILED'));
        }
        pumpTileWorkerPool();
      };
      pool.clients.push(client);
      worker.postMessage({type: 'warm'});
    } catch (error) {
      console.warn('Tile-worker kunde inte startas.', error);
    }
  }
  if (!pool.clients.length) {
    state.tileWorkersDisabled = true;
    return null;
  }
  state.tileWorkerPool = pool;
  return pool;
}

function warmTileWorkerPool() {
  try { ensureTileWorkerPool(); } catch (error) { console.debug('Worker-pool kunde inte förvärmas.', error); }
}

function transferableTileBuffer(data) {
  if (data instanceof ArrayBuffer) return data;
  if (ArrayBuffer.isView(data)) {
    const start = data.byteOffset;
    const end = start + data.byteLength;
    return start === 0 && end === data.buffer.byteLength ? data.buffer : data.buffer.slice(start, end);
  }
  throw new Error('MVT_TILE_BUFFER_INVALID');
}

function decodeTileInWorker(tile, data, deadline) {
  const pool = ensureTileWorkerPool();
  if (!pool || pool.disabled) return Promise.reject(new Error('TILE_WORKER_UNAVAILABLE'));
  const buffer = transferableTileBuffer(data);
  const promise = new Promise((resolve, reject) => {
    pool.queue.push({id: pool.nextId++, tile, buffer, deadline, resolve, reject});
    pumpTileWorkerPool();
  });
  return promiseBeforeDeadline(promise, deadline);
}

function tileCacheKey(tile) {
  return `${tile.z}/${tile.x}/${tile.y}`;
}

function getCachedDecodedTile(tile) {
  const key = tileCacheKey(tile);
  const cached = state.radiusTileCache.get(key);
  if (!cached) return null;
  state.radiusTileCache.delete(key);
  state.radiusTileCache.set(key, cached);
  return cached;
}

function cacheDecodedTile(key, features) {
  if (state.radiusTileCache.has(key)) state.radiusTileCache.delete(key);
  state.radiusTileCache.set(key, features);
  while (state.radiusTileCache.size > CONFIG.radiusSearchCacheTiles) {
    const oldest = state.radiusTileCache.keys().next().value;
    state.radiusTileCache.delete(oldest);
  }
}

async function parseDecodedTileMainThread(tile, data, deadline) {
  const {PbfReader, VectorTile} = await promiseBeforeDeadline(ensureMvtParser(), deadline);
  const vectorTile = new VectorTile(new PbfReader(data));
  const layer = vectorTile.layers?.place;
  if (!layer) return [];

  const candidates = [];
  for (let i = 0; i < layer.length; i++) {
    if ((i & 255) === 0 && remainingMs(deadline) <= 0) throw new Error('SEARCH_HARD_TIMEOUT');
    const vectorFeature = layer.feature(i);
    if (vectorFeature.type !== 1) continue;
    const props = vectorFeature.properties || {};
    if (!isUsablePlace(props, CONFIG.minimumConfidence)) continue;
    if (!mightMatchCategory(props)) continue;
    const classification = classifyPlaceDetailed(props);
    const categoryKey = classification?.key;
    if (!categoryKey) continue;

    const geometry = vectorFeature.loadGeometry();
    const point = geometry?.[0]?.[0];
    if (!point) continue;
    const coordinates = mvtPointToLngLat(tile, point, vectorFeature.extent || 4096);
    if (!coordinates) continue;
    const feature = {
      type: 'Feature',
      id: vectorFeature.id,
      properties: props,
      geometry: {type: 'Point', coordinates}
    };
    const normalized = normalizeFeature(feature, null, classification);
    if (normalized) candidates.push(normalized);
  }
  return candidates;
}

async function parseDecodedTile(tile, data, deadline) {
  const key = tileCacheKey(tile);
  const cached = getCachedDecodedTile(tile);
  if (cached) return cached;
  if (!data) {
    cacheDecodedTile(key, []);
    return [];
  }
  if (remainingMs(deadline) <= 0) throw new Error('SEARCH_HARD_TIMEOUT');

  let candidates;
  const pool = ensureTileWorkerPool();
  if (pool && !pool.disabled) {
    try {
      candidates = await decodeTileInWorker(tile, data, deadline);
    } catch (error) {
      if (error?.message === 'SEARCH_HARD_TIMEOUT') throw error;
      // The transferred tile buffer may be detached at this point. Disable the
      // worker path and let fetchTileWithRetry refetch once for main-thread
      // decoding rather than risk returning a partial result.
      if (!state.tileWorkerFallbackWarned) {
        state.tileWorkerFallbackWarned = true;
        console.warn('Worker-avkodning föll tillbaka till huvudtråden.', error);
      }
      resetTileWorkerPool({disable: true});
      throw new Error('TILE_WORKER_RETRY_MAIN');
    }
  } else {
    candidates = await parseDecodedTileMainThread(tile, data, deadline);
  }

  cacheDecodedTile(key, candidates);
  return candidates;
}

function addNormalizedFeatures(rawFeatures, center, radiusMeters, dedupe) {
  for (const feature of rawFeatures) {
    let normalized;
    if (feature?.properties?.categoryKey && feature?.geometry?.type === 'Point') {
      const distanceMeters = haversineMeters(center, feature.geometry.coordinates);
      if (distanceMeters > radiusMeters + 0.5) continue;
      normalized = {
        ...feature,
        properties: {...feature.properties, distanceMeters}
      };
    } else {
      normalized = normalizeFeature(feature, center);
      if (!normalized) continue;
      if (!Number.isFinite(normalized.properties.distanceMeters)) continue;
      if (normalized.properties.distanceMeters > radiusMeters + 0.5) continue;
    }
    const key = String(normalized.id);
    if (!dedupe.has(key)) dedupe.set(key, normalized);
  }
}

async function fetchRawTileFromArchive(tile, descriptor, deadline, signal) {
  if (remainingMs(deadline) <= 0) throw new Error('SEARCH_HARD_TIMEOUT');
  try {
    const response = await promiseBeforeDeadline(
      descriptor.archive.getZxy(tile.z, tile.x, tile.y, signal),
      deadline
    );
    return {data: response?.data || null, archiveIndex: descriptor.index};
  } catch (error) {
    throw new Error(`${descriptor.name}: ${String(error?.message || error)}`, {cause: error});
  }
}

function orderedArchives() {
  if (!state.pmtilesArchives.length) return [];
  const preferred = state.pmtilesArchives.find(item => item.index === state.activeArchiveIndex);
  const rest = state.pmtilesArchives.filter(item => item !== preferred);
  return preferred ? [preferred, ...rest] : [...state.pmtilesArchives];
}

function linkAbortSignal(signal, controllers) {
  if (!signal) return () => {};
  const abort = () => controllers.forEach(controller => {
    try { controller.abort(); } catch { /* noop */ }
  });
  if (signal.aborted) abort();
  else signal.addEventListener('abort', abort, {once: true});
  return () => signal.removeEventListener?.('abort', abort);
}

async function fetchTileHedged(tile, deadline, signal) {
  const cached = getCachedDecodedTile(tile);
  if (cached) return cached;
  const archives = orderedArchives();
  if (!archives.length) throw new Error('PMTILES_SOURCE_MISSING');

  // Only one decoder runs; reading ranges from other sources is a transport
  // fallback, NOT a duplicate MVT decode. All three paths participate.
  const controllers = archives.map(() => new AbortController());
  const unlinkAbort = linkAbortSignal(signal, controllers);
  const timers = [];
  const reads = archives.map((descriptor, i) => new Promise((resolve, reject) => {
    const start = () => {
      fetchRawTileFromArchive(tile, descriptor, deadline, controllers[i].signal)
        .then(resolve, reject);
    };
    if (i === 0) start();
    else timers.push(setTimeout(start, Math.min(i * CONFIG.radiusSearchHedgeDelayMs, Math.max(0, remainingMs(deadline) - 100))));
  }));
  try {
    const winner = await promiseBeforeDeadline(Promise.any(reads), deadline);
    state.activeArchiveIndex = winner.archiveIndex;
    controllers.forEach((controller, i) => { if (archives[i].index !== winner.archiveIndex) controller.abort(); });
    return await parseDecodedTile(tile, winner.data, deadline);
  } finally {
    unlinkAbort();
    timers.forEach(timer => clearTimeout(timer));
    controllers.forEach(controller => controller.abort());
  }
}

async function fetchTileWithRetry(tile, deadline, signal) {
  const key = tileCacheKey(tile);
  const cached = getCachedDecodedTile(tile);
  if (cached) return cached;
  const inFlight = state.radiusTilePromiseCache.get(key);
  if (inFlight) {
    try {
      return await promiseBeforeDeadline(inFlight, deadline);
    } catch (error) {
      // A point-mode prefetch may use a shorter deadline than the committed
      // search. Its timeout must not turn into a false tile failure here.
      if (signal?.aborted || remainingMs(deadline) <= 0) throw error;
      if (state.radiusTilePromiseCache.get(key) === inFlight) state.radiusTilePromiseCache.delete(key);
    }
  }

  const promise = (async () => {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fetchTileHedged(tile, deadline, signal);
      } catch (error) {
        lastError = error;
        if (error?.message === 'SEARCH_HARD_TIMEOUT' || signal?.aborted) throw error;
        if (attempt === 0 && remainingMs(deadline) > 350) {
          await new Promise(resolve => setTimeout(resolve, 35));
        }
      }
    }
    throw lastError || new Error('PMTILES_TILE_FAILED');
  })();
  state.radiusTilePromiseCache.set(key, promise);
  try {
    return await promiseBeforeDeadline(promise, deadline);
  } finally {
    if (state.radiusTilePromiseCache.get(key) === promise) state.radiusTilePromiseCache.delete(key);
  }
}

async function runPool(items, concurrency, task) {
  let next = 0;
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      await task(items[index], index);
    }
  }
  const workers = Array.from({length: Math.min(concurrency, items.length)}, () => worker());
  const settled = await Promise.allSettled(workers);
  const failed = settled.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
}

async function collectTilesComplete(tiles, center, radiusMeters, deadline, token) {
  const dedupe = new Map();
  const signal = state.radiusSearch.abortController?.signal;
  let completed = 0;
  let errors = 0;
  let firstError = null;
  let lastProgress = 0;
  const pending = [];

  const progress = () => {
    const now = performance.now();
    if (token === state.radiusSearch.token && state.radiusSearch.busy && (completed === tiles.length || now - lastProgress > 120)) {
      lastProgress = now;
      const progressText = `Söker inom ${formatRadius(radiusMeters)}… ${Math.min(completed, tiles.length)}/${tiles.length} dataplattor`;
      setStatus(progressText, 'info');
      if (radiusMeters >= 10000) {
        const subtitle = $('#result-total');
        if (subtitle) subtitle.textContent = progressText;
      }
    }
  };

  for (const tile of tiles) {
    const cached = getCachedDecodedTile(tile);
    if (cached) {
      addNormalizedFeatures(cached, center, radiusMeters, dedupe);
      completed += 1;
    } else {
      pending.push(tile);
    }
  }
  progress();
  if (!pending.length) return {features: [...dedupe.values()], errors: 0, timedOut: false, completed, firstError: null};

  // Direct concurrent z/x/y reads are faster for small/medium search circles
  // than over-fetching merged byte ranges. PMTiles still shares header and
  // directory promises internally. Slow tail requests are hedged to the second
  // Overture endpoint after a short delay.
  let interrupted = false;
  await runPool(pending, CONFIG.radiusSearchConcurrency, async tile => {
    if (token !== state.radiusSearch.token || !state.radiusSearch.center || signal?.aborted) return;
    try {
      const candidates = await fetchTileWithRetry(tile, deadline, signal);
      addNormalizedFeatures(candidates, center, radiusMeters, dedupe);
      completed += 1;
    } catch (error) {
      if (error?.message === 'SEARCH_HARD_TIMEOUT' || signal?.aborted) {
        interrupted = true;
        return;
      }
      errors += 1;
      if (!firstError) firstError = describeOvertureFailure(error);
      console.warn('Radiesökning: dataplattan kunde inte verifieras från någon Overture-källa.', tile, error);
    } finally {
      progress();
    }
  });

  return {
    features: [...dedupe.values()],
    errors,
    timedOut: interrupted || Boolean(signal?.aborted),
    completed,
    firstError
  };
}


async function prefetchPointSearchArea() {
  if (!state.map || !state.pmtilesArchives.length || state.radiusSearch.busy) return;
  state.radiusSearch.prefetchController?.abort();
  const controller = new AbortController();
  state.radiusSearch.prefetchController = controller;
  const mapCenter = state.map.getCenter();
  const center = [mapCenter.lng, mapCenter.lat];
  let tiles;
  try {
    tiles = tilesForRadius(center, state.radiusSearch.radiusMeters, CONFIG.radiusSearchZoom, CONFIG.radiusSearchMaxTiles)
      .filter(tile => !getCachedDecodedTile(tile))
      .slice(0, CONFIG.radiusSearchPrefetchTiles);
  } catch {
    return;
  }
  if (!tiles.length) return;
  const deadline = performance.now() + Math.min(4000, CONFIG.radiusSearchHardMaxMs - 500);
  await runPool(tiles, Math.min(16, CONFIG.radiusSearchConcurrency), async tile => {
    if (controller.signal.aborted || remainingMs(deadline) <= 0) return;
    try {
      await fetchTileWithRetry(tile, deadline, controller.signal);
    } catch (error) {
      if (error?.message !== 'SEARCH_HARD_TIMEOUT' && !controller.signal.aborted) {
        console.debug('Förvärmning av söktile misslyckades; ordinarie sökning försöker igen.', tile, error);
      }
    }
  });
  if (state.radiusSearch.prefetchController === controller) state.radiusSearch.prefetchController = null;
}

async function runRadiusSearch() {
  const center = state.radiusSearch.center;
  if (!center) return;
  // Invalidate the previous search BEFORE waiting for an Overture header. Old
  // results must never stay visible beneath a NEW search circle.
  state.radiusSearch.abortController?.abort();
  const controller = new AbortController();
  state.radiusSearch.abortController = controller;
  const token = ++state.radiusSearch.token;
  const radiusMeters = state.radiusSearch.radiusMeters;
  const searchStartedAt = performance.now();

  // Reset an old selection before fetching new tiles (kept inline so the
  // original search coroutine remains standalone and regression-testable).
  state.popup?.remove();
  state.popup = null;
  state.selectedFeatureId = null;
  state.map?.getSource?.('selected-craft')?.setData({type:'FeatureCollection',features:[]});
  // Inline reset: search coroutine is also exercised in isolation by regression tests.
  state.selectedDomMarker?.remove();
  state.selectedDomMarker = null;
  state.radiusSearch.busy = true;
  state.radiusSearch.partialErrors = 0;
  state.radiusSearch.sourceError = null;
  state.radiusSearch.timedOut = false;
  state.radiusSearch.elapsedMs = null;
  state.radiusSearch.incomplete = false;
  state.radiusSearch.checkedTiles = 0;
  state.radiusSearch.totalTiles = 0;
  state.visibleFeatures = [];
  state.baseOvertureFeatures = [];
  state.featureById.clear();
  $('#sidebar')?.classList.remove('has-results');
  $('#sidebar')?.classList.add('has-search');
  updateGeoJson([]);
  updateResultList([]);

  if (!state.pmtilesArchives.length) {
    if (state.pmtilesSelectionFailed) startOvertureSelection();
    setStatus('Ansluter till Overture Places…', 'info');
    try {
      await state.pmtilesSelectionPromise;
    } catch (error) {
      if (token !== state.radiusSearch.token || controller.signal.aborted) return;
      state.radiusSearch.busy = false;
      state.radiusSearch.partialErrors = 1;
      state.radiusSearch.sourceError = describeOvertureFailure(error);
      state.radiusSearch.elapsedMs = performance.now() - searchStartedAt;
      updateResultList([]);
      setStatus('Företagskällan kunde inte nås. Kontrollera internetanslutningen och försök igen.', 'error');
      return;
    }
    if (token !== state.radiusSearch.token || controller.signal.aborted ||
        state.radiusSearch.center !== center || !state.pmtilesArchives.length) return;
  }

  // Källa och tillåtna plattor kontrolleras före sökningens tidsbudget.
  // Overture Places finns med fullständiga företagsegenskaper på zoom 14;
  // vi går därför inte ned i zoom för att påstå att 20 km är komplett.
  let tiles;
  try {
    tiles = tilesForRadius(center, radiusMeters, CONFIG.radiusSearchZoom, CONFIG.radiusSearchMaxTiles);
  } catch (error) {
    if (token !== state.radiusSearch.token || controller.signal.aborted) return;
    state.radiusSearch.busy = false;
    state.radiusSearch.partialErrors = 1;
    state.radiusSearch.sourceError = {cause: error.message || 'Sökområdet är för stort.'};
    state.radiusSearch.elapsedMs = performance.now() - searchStartedAt;
    updateResultList([]);
    setStatus(error.message || 'Sökområdet är för stort.', 'error');
    return;
  }

  const searchBudgetMs = deadlineForRadiusSearch(radiusMeters, tiles.length, CONFIG.radiusSearchHardMaxMs);
  state.radiusSearch.deadlineMs = searchBudgetMs;
  const hardDeadline = performance.now() + searchBudgetMs;
  state.radiusSearch.totalTiles = tiles.length;
  setStatus(`Söker inom ${formatRadius(radiusMeters)}… 0/${tiles.length} dataplattor`, 'info');

  // Five seconds is a performance target, not a cut-off. At 5 s we only update
  // the status. The search keeps running until every required tile is complete.
  const targetTimer = setTimeout(() => {
    if (token === state.radiusSearch.token && state.radiusSearch.busy) {
      setStatus(`Söker fortfarande inom ${formatRadius(radiusMeters)}… fullständigt resultat inväntas.`, 'info');
    }
  }, CONFIG.radiusSearchTargetMs);

  // Sökområden över 5 km har längre men begränsad tidsbudget. Vid timeout
  // märks alla bekräftade träffar som delresultat; sparade plattor återanvänds.
  const hardTimer = setTimeout(() => {
    // An older timeout must never abort the controller of a newer search.
    if (token === state.radiusSearch.token && state.radiusSearch.abortController === controller) {
      controller.abort();
      resetTileWorkerPool();
    }
  }, searchBudgetMs);

  // Decoder workers are warmed at application boot. Only browsers where module
  // workers are unavailable load the fallback decoder on the main thread.
  warmTileWorkerPool();
  if (state.tileWorkersDisabled) {
    try {
      await promiseBeforeDeadline(ensureMvtParser(), hardDeadline);
    } catch (error) {
      if (error?.message === 'SEARCH_HARD_TIMEOUT') controller.abort();
    }
  }

  let result;
  try {
    result = await collectTilesComplete(tiles, center, radiusMeters, hardDeadline, token);
  } catch (error) {
    const timedOut = error?.message === 'SEARCH_HARD_TIMEOUT' || controller.signal.aborted;
    result = {features: [], errors: timedOut ? 0 : 1, timedOut, completed: 0, firstError: describeOvertureFailure(error)};
    if (!timedOut) console.error('Radiesökningen kunde inte slutföras.', error);
  }

  clearTimeout(targetTimer);
  clearTimeout(hardTimer);
  if (token !== state.radiusSearch.token || !state.radiusSearch.center) return;

  const complete = !result.timedOut && result.errors === 0 && result.completed === tiles.length;
  const partialFeatures = Array.isArray(result.features) ? result.features : [];
  state.radiusSearch.checkedTiles = result.completed || 0;
  state.radiusSearch.totalTiles = tiles.length;
  state.radiusSearch.incomplete = !complete;
  state.radiusSearch.busy = false;
  state.radiusSearch.partialErrors = complete ? 0 : Math.max(result.errors, complete ? 0 : 1);
  state.radiusSearch.timedOut = Boolean(result.timedOut);
  state.radiusSearch.sourceError = result.firstError || null;
  state.radiusSearch.elapsedMs = performance.now() - searchStartedAt;

  // Never present a truncated set as a COMPLETE search: warn prominently.
  // Only successfully decoded Overture tiles are shown; when a tile failed,
  // present their verified matches as a CLEARLY MARKED incomplete subset.
  // Never imply that the subtotal is exhaustive, even if it contains zero rows.
  state.baseOvertureFeatures = partialFeatures;
  state.visibleFeatures = partialFeatures;
  $('#sidebar')?.classList.toggle('has-results', partialFeatures.length > 0);
  state.featureById = new Map(state.visibleFeatures.map(feature => [String(feature.id), feature]));
  applyCategoryFilter();
  const displayed = filteredFeatures();
  if (displayed.length) requestAnimationFrame(() => {
    if (token === state.radiusSearch.token) fitToRadiusResults(displayed);
  });
  requestAnimationFrame(() => {
    if (token !== state.radiusSearch.token) return;
    const panel = $('.panel-content');
    const results = $('.results-section');
    // After each search, mobile panels MUST start at the filter controls.
    // The physical DOM block precedes the result list, unlike r17.12's
    // fragile CSS-only ordering. Desktop still prioritises the results.
    const focus = window.matchMedia('(max-width:760px)').matches
      ? $('#filter-tools') || results
      : results;
    if (panel && focus) {
      const focusBox = focus.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      const targetTop = panel.scrollTop + focusBox.top - panelBox.top - 14;
      panel.scrollTo({top: Math.max(0, targetTop), behavior: 'instant'});
    }
  });

}

function clearAddressChoices({ abort = true } = {}) {
  if (abort) {
    state.addressLookup.controller?.abort();
    state.addressLookup.token += 1;
  }
  state.addressLookup.controller = null;
  state.addressLookup.busy = false;
  $('#address-submit').disabled = !state.map?.getSource('search-area');
  $('#address-results').replaceChildren();
  $('#address-results').hidden = true;
}
async function submitAddressLookup(event) {
  event.preventDefault();
  const input = $('#address-input');
  if (!state.map?.getSource('search-area')) {
    $('#address-search-note').textContent = 'Kartan laddas. Försök när kartan är klar.';
    return;
  }
  const query = input.value.trim();
  clearAddressChoices();
  if (query.length < 2) {
    $('#address-search-note').textContent = 'Skriv en adress eller ort med minst två tecken.';
    input.focus();
    return;
  }
  const token = state.addressLookup.token;
  const controller = new AbortController();
  state.addressLookup.controller = controller;
  state.addressLookup.busy = true;
  $('#address-submit').disabled = true;
  $('#address-search-note').textContent = 'Letar efter adresser…';
  try {
    const choices = await fetchAddressChoices(query, {
      endpoint: CONFIG.addressSearchUrl, signal: controller.signal, timeoutMs: 6500
    });
    if (token !== state.addressLookup.token) return;
    const wrap = $('#address-results');
    wrap.replaceChildren();
    if (!choices.length) {
      $('#address-search-note').textContent = 'Ingen säker svensk adress hittades. Välj plats direkt på kartan.';
      return;
    }
    $('#address-search-note').textContent = 'Välj rätt adress nedan. Sökningen startar när du väljer.';
    wrap.hidden = false;
    choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'address-choice';
      button.textContent = choice.label;
      button.addEventListener('click', () => {
        clearAddressChoices();
        input.value = choice.label;
        $('#address-search-note').textContent = 'Adress vald – söker företag i området.';
        cancelPointPicking();
        state.map?.jumpTo({center: choice.coordinates, zoom: Math.max(state.map.getZoom(), 13)});
        setRadiusSearchPoint(choice.coordinates);
      });
      wrap.append(button);
    });
  } catch (error) {
    if (token !== state.addressLookup.token) return;
    $('#address-search-note').textContent = error?.name === 'AbortError'
      ? 'Adressökningen tog för lång tid. Försök igen eller välj på kartan.'
      : 'Adressökningen kunde inte slutföras. Välj plats på kartan i stället.';
  } finally {
    if (token === state.addressLookup.token) {
      state.addressLookup.busy = false;
      state.addressLookup.controller = null;
      $('#address-submit').disabled = !state.map?.getSource('search-area');
    }
  }
}

function bindUi() {
  $('#results').addEventListener('click', (event) => {
    const button = event.target.closest('.result-card');
    if (!button) return;
    const feature = state.featureById.get(String(button.dataset.id || ''));
    if (feature) focusFeature(feature);
  });
  let textFilterFitTimer = null;
  $('#business-search').addEventListener('input', () => {
    applyCategoryFilter();
    clearTimeout(textFilterFitTimer);
    textFilterFitTimer = setTimeout(() => refitFilteredResults(), 280);
  });
  $('#reset-filters').addEventListener('click', clearAllResultFilters);
  $('#retry-results').addEventListener('click', () => {
    if (!state.radiusSearch.busy && state.radiusSearch.center) runRadiusSearch();
  });
  $('#more-results').addEventListener('click', () => {
    state.resultLimit = (state.resultLimit || 40) + 40;
    updateResultList(filteredFeatures());
  });
  $('#clear-search').addEventListener('click', () => {
    $('#business-search').value = '';
    applyCategoryFilter({refit: true});
    $('#business-search').focus();
  });
  $('#category-toggle').addEventListener('click', () => {
    const categories = $('#category-list');
    const controls = $('#toggle-all');
    const show = categories.hidden;
    categories.hidden = !show;
    controls.hidden = !show;
    const button = $('#category-toggle');
    button.textContent = show ? 'Dölj alternativ' : 'Visa alternativ';
    button.setAttribute('aria-expanded', String(show));
  });
  $('#toggle-all').addEventListener('click', () => {
    const inputs = [...document.querySelectorAll('#category-list input[type=checkbox]')];
    const allChecked = inputs.every(i => i.checked);
    inputs.forEach(i => i.checked = !allChecked);
    state.selectedCategories = new Set(!allChecked ? Object.keys(CATEGORIES) : []);
    updateCategorySelectionLabel();
      applyCategoryFilter({refit: true});
  });
  $('#search-map-center').addEventListener('click', () => {
    if (state.radiusSearch.picking) {
      cancelPointPicking();
      $('#radius-help').textContent = 'Platsval avbrutet. Tryck igen för att välja punkt.';
    } else {
      clearAddressChoices();
      beginPointPicking();
    }
  });
  const addressDetails = $('#address-lookup-details');
  if (addressDetails) {
    addressDetails.open = !window.matchMedia('(max-width:760px)').matches;
  }
  $('#address-search-form').addEventListener('submit', submitAddressLookup);
  $('#address-input').addEventListener('input', () => {
    clearAddressChoices();
    $('#address-search-note').textContent = 'Adress skickas endast när du klickar på Hitta adress.';
  });
  $('#radius-select').addEventListener('change', (event) => {
    const requested = Number(event.target.value);
    state.radiusSearch.radiusMeters = [500, 1000, 2000, 5000, 10000, 20000].includes(requested) ? requested : 1000;
    const note = $('#radius-scale-note');
    if (note) {
      note.hidden = state.radiusSearch.radiusMeters < 10000;
      note.textContent = state.radiusSearch.radiusMeters === 20000
        ? '20 km omfattar många företag och kan ta längre tid. Ofullständiga resultat markeras.'
        : '10 km kan ta längre tid än en vanlig sökning.';
    }
    if (state.radiusSearch.center && !state.radiusSearch.picking) {
      $('#radius-help').textContent = `Söker inom ${formatRadius(state.radiusSearch.radiusMeters)} från vald punkt. Välj ny plats för att söka någon annanstans.`;
      updateSearchArea();
      fitToSearchArea();
      runRadiusSearch();
    }
  });
  $('#clear-radius-search').addEventListener('click', clearRadiusSearch);
  $('#show-search-area').addEventListener('click', () => {
    if (state.radiusSearch.center) fitToSearchArea();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.radiusSearch.picking) cancelPointPicking();
    if (event.key === 'Escape' && document.querySelector('.mobile-company-overlay')) {
      closeCompanyPopup();
    }
  });
  $('#panel-toggle').addEventListener('click', () => {
    const collapsed = !$('#sidebar').classList.contains('is-collapsed');
    // A manual opening or closing takes precedence over the search's automatic panel state.
    window.hkAutoCollapsedForPick = false;
    if (!collapsed) closeCompanyPopup();
    setMobilePanelCollapsed(collapsed);
  });
  // Recreate the marker if the device rotates between phone and wide layouts.
  let markerViewportTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(markerViewportTimer);
    markerViewportTimer = setTimeout(() => {
      const current = state.selectedFeatureId == null ? null : state.featureById.get(state.selectedFeatureId);
      syncSelectedDomMarker(current || null);
    }, 180);
  });
  $('#about-open').addEventListener('click', () => $('#about-dialog').showModal());
  $('#about-close').addEventListener('click', () => $('#about-dialog').close());
}

window.HK_BOOT?.moduleStarted?.();

async function boot() {
  fillStaticUi();
  buildCategoryControls();
  bindUi();
  setStatus('Laddar karta…', 'info');
  warmTileWorkerPool();
  maplibregl = await loadMapLibre();
  initMap();
}

boot().catch((error) => {
  console.error('Hantverkarkartan kunde inte starta.', error);
  const mapLibreFailure = String(error?.message || error).includes('MAPLIBRE') || !maplibregl?.Map;
  const message = mapLibreFailure
    ? 'Kartmotorn MapLibre kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.'
    : 'Hantverkarkartan kunde inte starta. Ladda om sidan; om felet kvarstår, kontrollera internetanslutningen.';
  setStatus(message, 'error');
  window.HK_BOOT?.fail?.(message);
});
