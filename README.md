# ASTRA

A presentation-first light-pollution and astronomical-observation prototype, built around a cinematic Oman case study.

## Run locally

```powershell
cd G:\pc\ali_project\ha\astra
npm install
npm run dev -- --port 4173
```

Open http://localhost:4173. The preview is started automatically during development.

```powershell
npx tsc --noEmit
npm run build
npm run preview -- --port 4173
```

## Present

Select **Present** in the navigation. Use left/right arrows or the on-screen controls to move through eleven story stops. Escape exits. Keyboard shortcuts leave sliders, selectors, map navigation, and tabs available for their own interactions. A compact controller stays visible while other navigation is hidden.

**Demo** opens the focused map experience with Observe, Sources, and Improve tabs. Escape closes it. EN / AR changes all primary text and uses RTL for Arabic; maps retain geographic orientation.

## Implementation

React, TypeScript, Vite, Leaflet, Phosphor icons, and locally bundled Manrope, Inter, and Noto Sans Arabic fonts. The selected Product Design starter uses Vite. There is no backend, authentication, or database. CSS transitions and limited number interpolation provide motion, with reduced-motion support.

## Data and imagery

`src/data/` contains fixed comparison coordinates, real OpenStreetMap place references, published experiment results, and science sources. The former synthetic heatmap, arbitrary /100 scores, attribution percentages and skyglow response weights have been retired.

`src/components/ObservationProvider.tsx` makes one shared request to the public Open-Meteo forecast API and supports manual refresh. It validates units, coordinates, timestamps and missing fields, then stores the actual response locally. If the API fails, a dated saved response is shown as cached; expired forecast hours display missing values. It never generates replacement measurements. These are weather model forecasts, not ground observations. The three selected points are comparison locations, not certified observing sites. Forecasts use the next 20:00 in Oman (UTC+4), with the following morning's sunrise. Elevation refers to the API model grid cell.

`src/lib/scenario.ts` contains arithmetic for the affected fixtures' power reduction. Improve sliders recalculate (before − after) / before immediately; after cannot exceed before, and before is at least 1%. Map, observing, sources, Improve and demo share the selected location; Improve shows that location's actual forecast context. Weather remains independent of dimming. The separate reference presents Barentine et al.'s published 2019 Tucson experiment: 90% → 30% fixture power draw, with measured zenith sky-brightness decreases of 5.4 ± 0.9% near the city centre and 3.6 ± 0.9% at an adjacent suburban site. These fixed findings are never extrapolated to other slider settings, Oman or citywide energy savings.

The bounded geographic basemap uses NASA GIBS Blue Marble topography/bathymetry imagery (2004-07-01), cached locally at zooms 6–8. Zoom 9 uses the zoom-8 images. No external map request is necessary for the supported Oman area. NASA attribution remains visible on each map. The map cache can be regenerated with `python scripts/cache-map.py`.

The active maps and comparison use real NASA GIBS VIIRS Black Marble display imagery from 2012 and 2016. These are historical composites, not live imagery, quantitative radiance samples, or ground SQM readings. Cached tiles are in `public/map-tiles-night/`; provenance and geographic crop bounds are in `public/data/imagery-provenance.json`. The slider compares the same northern Oman region across these two years; it is not an intervention before/after. Its wider images can be rebuilt from cached tiles with `python scripts/build-comparison.py`. No local SQM sensor is connected and this absence is stated in the UI.

OpenStreetMap/Nominatim place reference points are saved with object IDs, source links and retrieval dates in `src/data/sourceContributions.json`. Straight-line distances use the haversine formula with mean Earth radius 6371.0088 km; they do not imply measured source contributions. Raw source responses are in `qa/source-research/`. Open-Meteo attribution (CC BY 4.0), OSM attribution (ODbL) and NASA attribution remain visible. The public Open-Meteo endpoint is for non-commercial use; a commercial deployment should use the provider's licensed endpoint.

Active image assets:

- `public/images/hero/earth-orbit.webp` — approved decorative space art, explicitly labelled.
- `public/images/observations/muscat-2012.webp` — actual NASA imagery.
- `public/images/observations/muscat-2016.webp` — actual NASA imagery.

Previous generated Oman landscapes remain as unused assets; the active factual examples do not use them. `python scripts/fetch-real-data.py` refreshes the weather snapshot and NASA cache. `python scripts/fetch-nominatim.py` refreshes place references, sequentially with rate limiting. `node --test tests/real-data.test.mjs` verifies missing-data handling, unit validation, time zones, geographic distances and the power calculation. More details are in `DATA-SOURCES.md`.

`design-reference.png` records the selected refined design target. `design-qa.md` records the browser verification and visual comparison. No deployment has been performed.

## Crescent and star planner

Plan observation links to an interactive planner using Astronomy Engine 2.1.19. It calculates local sunset, Moon phase/illumination/age, Moon altitude and elongation, and astronomical twilight for the selected site/date. The crescent attempt uses sunset + 4/9 of sunset-to-moonset lag only during waxing crescent with the Moon above the horizon. This is timing only: no Yallop visibility class or confirmed sighting is claimed. Stars prefer a complete Moon-free hour with Sun below -18 degrees, then the lowest available hourly cloud forecast (15-minute candidate spacing, nearest midpoint forecast). If the forecast does not cover the date, the suggestion is explicitly geometry-only. All times use Oman UTC+4; next-day events are labelled. Flat sea-level horizon assumptions and limits are displayed. Source links are inside the planner. Run npm run test:astronomy.

## Deploy to Vercel

Import https://github.com/ali-cs2/astra-team into Vercel. Root Directory: repository root. Framework: Vite. Build Command: npm run build. Output Directory: dist/client. These are set in vercel.json; leave the root at the repository root, not src or dist. No API keys or environment variables are required. Node.js 22 or newer is recommended. npm ci installs the lockfile. All maps, images and fonts are served from public assets; Open-Meteo is the only live data request and has an honest dated-cache fallback. SPA route fallback is configured. The optional Sites packaging remains intact but Vercel serves only dist/client. The deploy check and runtime preview passed locally; no Vercel deployment has been created by this task.
