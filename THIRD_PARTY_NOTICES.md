# Third-party notices — Hantverkarkartan

Release: 2026-11-09 (r17.2)

## Overture Maps Places

Hantverkarkartan reads the Overture Maps Places theme from Overture's published PMTiles release.

Overture Places uses multiple upstream datasets and is published under permissive licenses depending on source. Current source-specific attribution is maintained by Overture at:
https://docs.overturemaps.org/attribution/

Relevant notices for the configured 2026-10-21.0 release include:

- Meta, Microsoft, PinMeTo, Krick, RenderSEO, DAC and BrightQuery data: CDLA Permissive 2.0 as documented by Overture.
- AllThePlaces: CC0 1.0 as documented by Overture.
- Foursquare: Apache License 2.0. Copyright 2024 Foursquare Labs, Inc. All rights reserved. Foursquare data was transformed to the Overture schema. Overture documents the change date as 2026-03-18.

A copy of Apache License 2.0 is included at `licenses/Apache-2.0.txt`.

Hantverkarkartan does not modify Overture's hosted PMTiles archive; it reads selected records client-side and classifies them into service groups for display. Hantverkarkartan application classification layer is retained from r17.1 (2026-11-09).

## OpenFreeMap / OpenMapTiles / OpenStreetMap

The basemap uses the OpenFreeMap public instance and its Liberty style. OpenFreeMap requires attribution and states that MapLibre adds it automatically. The visible map also retains MapLibre's attribution control.

Required map-data attribution shown by the source/style includes OpenFreeMap / OpenMapTiles and OpenStreetMap contributors as applicable.

OpenFreeMap project: MIT. Map data is sourced from OpenStreetMap under its applicable data license.

## MapLibre GL JS

Version pinned by this release: 6.10.0.
License: BSD-3-Clause.
Project: https://maplibre.org/maplibre-gl-js/

The browser currently fetches the pinned browser build and stylesheet from jsDelivr. If you vendor these files locally later, preserve the upstream license and copyright notices.

## PMTiles JavaScript

Version pinned by this release: 4.5.0.
License: BSD-3-Clause.
Project: https://github.com/protomaps/PMTiles

The browser currently fetches the pinned browser build from jsDelivr. If you vendor it locally later, preserve the upstream license and copyright notices.

## @mapbox/vector-tile

Version pinned by this release: 3.0.0.
License: BSD-3-Clause.
Project: https://github.com/mapbox/vector-tile-js

Used client-side to decode Overture's MVT vector tiles returned from the PMTiles archive. The browser fetches the pinned ESM build from jsDelivr.

## pbf

Version pinned by this release: 5.1.2.
License: BSD-3-Clause.
Project: https://github.com/mapbox/pbf

Used by `@mapbox/vector-tile` to decode Protocol Buffer data. The browser fetches the pinned ESM build from jsDelivr.

## Hantverkarkartan application code

The original Hantverkarkartan code in this release is provided under the MIT License; see `LICENSE`.



## Photon (valfri adressökning i lokal testversion)
Photon av komoot (https://github.com/komoot/photon) är en OpenStreetMap-baserad geokodningstjänst. Den publika demotjänsten har ingen driftsgaranti och kan begränsa anrop. Underliggande kartdata: © OpenStreetMap contributors (ODbL), https://www.openstreetmap.org/copyright. Publik produktion ska ha egen eller avtalad geokodning.

## Varumärkesmaterial

Appikon och logotyp har tagits från den bild som levererats av beställaren 2026-11-09. Bildmaterialet ingår inte i tredjepartskodens MIT-licens. `assets/brand-lockup.png` är en beskuren del av referensbilden; `assets/app-icon-*.png` är skalade versioner av ikonen. Ingen vektororiginalfil påstås finnas.
