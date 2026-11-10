export const CONFIG = Object.freeze({
  appName: 'Hantverkarkartan',
  appVersion: '2026.11.10-r17.11-mobile-selection',
  countryName: 'Sverige',
  overtureRelease: '2026-10-21.0',
  // Public launch requires a controlled same-origin range-capable PMTiles endpoint.
  // Leave blank for LOCAL DEVELOPMENT ONLY; published Overture tiles are not production-guaranteed.
  productionPlacesUrl: '',
  // Endast tillåtna, dokumenterade reservutgåvor; inga resultat från olika utgåvor blandas.
  overtureFallbackReleases: ['2026-09-23.1'],
  overturePlacesCdnUrl: 'https://tiles.overturemaps.org/2026-10-21.0/places.pmtiles',
  overturePlacesUrl: 'https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/2026-10-21.0/places.pmtiles',
  baseStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  // Photon public demo: for local testing only. Production requires own/licensed geocoder.
  addressSearchUrl: 'https://photon.komoot.io/api',
  minimumConfidence: 0.55,
  initialView: { center: [15.0, 62.0], zoom: 4.6 },
  swedenBounds: [[10.2, 54.4], [25.5, 69.8]],
  radiusSearchZoom: 14,
  radiusSearchMaxTiles: 2600, // Zoom 14 krävs för fullständiga Overture Places; 20 km i norra Sverige kan överstiga 2000 bbox-plattor.
  radiusSearchConcurrency: 12,
  radiusSearchWorkerMax: 6,
  radiusSearchHedgeDelayMs: 600,
  radiusSearchPrefetchTiles: 6,
  radiusSearchTargetMs: 5000,
  radiusSearchHardMaxMs: 30000,
  radiusSearchCacheTiles: 1800,
  // Angiven operatör/kontakt. Drift, integritet och produktionskällor kräver separat granskning före publicering.
  operator: {
    name: 'Robert Nord',
    contactEmail: 'robert_nord@outlook.com'
  },
  reportIssueUrl: 'https://github.com/OvertureMaps/data/issues/new/choose',
  overturePlacesDocsUrl: 'https://docs.overturemaps.org/guides/places/',
  dataAttributionUrl: 'https://docs.overturemaps.org/attribution/'
});
