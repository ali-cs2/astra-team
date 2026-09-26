# Active sources and limits

| Display | Actual source | Date / refresh | Meaning |
|---|---|---|---|
| Cloud cover, relative humidity, visibility, elevation, sunset and next sunrise | [Open-Meteo forecast API](https://open-meteo.com/en/docs), CC BY 4.0 | Fetched on page load and manual refresh; receipt time displayed | Weather model forecasts for a nearby grid cell, not ground measurements. Visibility is converted from metres to kilometres. |
| Night-light map and comparison | [NASA GIBS / VIIRS Black Marble](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/) | Historical annual composites: 2012 and 2016 | Actual satellite-derived display imagery. Display stretch / processing is not a calibrated radiance measurement and is not converted to SQM or Bortle class. |
| Terrain with night lights disabled | [NASA GIBS Blue Marble](https://www.earthdata.nasa.gov/data/tools/gibs) | 2004-07-01 | Geographic relief / bathymetry, not light-pollution data. |
| Settlement points | [OpenStreetMap](https://www.openstreetmap.org/copyright) through [Nominatim](https://nominatim.org/release-docs/latest/api/Search/), ODbL | Retrieved 2026-09-26, cached with each OSM object link | Representative points from the source, including administrative relation centroids. They are not documented lamp inventories. |
| Distances | Haversine calculation between fixed comparison coordinates and OSM reference points | Recalculated when selecting a location | Spherical straight-line kilometres, not driving distance or skyglow contribution. Mean Earth radius: 6371.0088 km. |
| Lighting intervention | [Barentine et al., 2020](https://arxiv.org/abs/2005.12357) | Tucson experiment in 2019 | Ground-measured zenith sky brightness decreases: 5.4 ± 0.9% near the centre; 3.6 ± 0.9% at an adjacent suburban site. |
| Power reduction | Arithmetic from user-entered before/after fixture power percentages; defaults are the paper's 90% → 30% settings | Interactive calculation, labelled as user inputs when changed | (before−after)/before × 100, with 66.7% at the default settings. Only affected fixtures' power, not citywide energy savings or a sky-brightness prediction. Local forecast context follows the shared location selection, independently of dimming. |

Comparison points are fixed WGS84 coordinates selected for this application: Muscat area (23.588, 58.383), Jebel Akhdar area (23.073, 57.666), and Sharqiyah Sands (22.25, 58.67). They do not imply official observatories, verified access, or optimal sites. The API request lists these exact coordinates; returned grid coordinates and model elevations may differ. Rows are sorted only by forecast cloud cover, not an overall astronomical suitability score. Moonlight, atmospheric seeing and local obstructions are not evaluated.

The forecast hour is the next 20:00 in Oman (UTC+4). Sunset comes from the same date and sunrise from the next morning. These times are sunset/sunrise, not astronomical twilight. A saved response always shows its receipt date and cached status. If it no longer covers the requested night, values display `—` rather than reusing an old forecast as current. Partial missing values also remain missing.

The approved Earth hero remains decorative generated artwork, explicitly labelled as space art. It is not used to calculate or demonstrate measured scientific changes. Former generated Oman comparison images are inactive; every active factual image is NASA imagery.

No live ground SQM sensor, calibrated VIIRS radiance sampling, Bortle conversion, municipal lighting inventory, or causal attribution model is connected. These unavailable outputs are not manufactured. NASA imagery is a historical visual reference, whereas forecast values refresh from the API.

## Audit trail

- `public/data/weather-snapshot.json`: exact saved API response, request URL and fetch timestamp.
- `public/data/imagery-provenance.json`: NASA layer, years, tile URL and comparison crop bounds.
- `src/data/sourceContributions.json`: actual OSM object IDs / links and representative coordinates.
- `qa/source-research/nominatim-*.json`: exact geocoding responses.
- `src/data/simulationScenarios.json`: values transcribed from the published Tucson experiment.
- `tests/real-data.test.mjs`: unit / missing-data validation, cache round-trip, next-night time zone, distance and power arithmetic.

The public Open-Meteo endpoint needs no secret for this non-commercial prototype. For a commercial deployment, use its licensed commercial endpoint; keep attribution. There are no credentials embedded in this application.

## Astronomical planner

Astronomy Engine 2.1.19 (https://github.com/cosinekitty/astronomy/tree/master/source/js) calculates solar/lunar geometry from site coordinates and UTC dates, rather than returning observed sightings. Crescent timing uses the Yallop best-time relation documented at https://astronomycenter.net/pdf/robb_2107_paper.pdf (sunset + 4/9 lag); no visibility classification is computed. USNO astronomical twilight definitions: https://aa.usno.navy.mil/faq/RST_defs. Local astronomical darkness is Sun altitude below -18 degrees. Star slots prefer Moon below the horizon throughout a full hour, then rank forecast cloud cover where available; absent forecast hours remain missing. Timing assumes a standard sea-level, unobstructed horizon. Ground elevation, haze, seeing, optics and topography are not modelled. The included Astronomy Engine MIT notice is public/ASTRONOMY-LICENSE.txt.
