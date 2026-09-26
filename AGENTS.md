# Prototype Instructions

Current visual direction: carry the earlier night-sky prototype's liquid-glass theme through ASTRA. Use deep navy, diffused blue light, soft white text, restrained warm accents, consistent card padding and borders, and cinematic motion. Let headings, images, maps and cards reveal when each enters the viewport; animate real numeric readouts to their sourced value. Preserve the existing data meaning, layout flow, copy and interactive controls while polishing visuals. The user later allowed browser review of the animation fix.

Latest presentation scope: show the English interface only. Pitch sequence: cinematic opening, define light pollution and who it affects, local Hijri crescent and astronomy relevance, sourced change-over-time evidence, ASTRA's proposed workflow, live "see for yourself" crescent finder, then the interactive 3D lamp lighting chapter. Detailed map, planner, source, simulation, case study, and science sections follow. Keep visible copy short enough to support a spoken hackathon pitch. The finder is an explicitly limited Oman pilot: location is used locally to compare three known sites, and the calculated azimuth/altitude is observing guidance, not a guaranteed crescent sighting or Hijri-calendar decision.

Scroll motion lives in one `useLayoutEffect` observer in `src/App.tsx`. It applies `motion-pending` before paint and swaps it for `motion-in` once per target; matching rules are in `src/liquid-glass.css`. Keep whole-section `.reveal` containers static. Do not add a second entrance animation to them: the previous overlap caused visible flashing while scrolling.

Improve must be interactive: share the selected location across map, observing, sources, Improve and demo; show that location's real forecast context. Dimming sliders update only calculated affected-fixture power reduction. Keep Tucson sky-brightness measurements as a separate fixed published reference; do not fabricate a local sky response to weather or arbitrary dimming inputs.

Comparison feedback: show a complete, wider geographic region rather than a heavily zoomed narrow strip. Keep the comparison compact (960px maximum width, native image aspect on desktop), display identical northern Oman bounds for both years, and use contain sizing to prevent clipping. Preserve the real NASA data and working slider.

User requires all factual examples to use real attributable sources, with APIs where suitable. Active data must use Open-Meteo model forecasts (dated, not ground observations), NASA VIIRS Black Marble historical 2012/2016 imagery, OpenStreetMap/Nominatim settlement reference coordinates, and published Tucson ground measurements. Remove fabricated sky scores, synthetic heatmaps, source percentages and arbitrary lighting response weights. Do not extrapolate Tucson measurements to Oman. Space hero remains explicitly decorative art. Display dates, units, source links, missing data and cache status honestly; never substitute invented fallback values.

Latest approved hero direction: cinematic outer space, Earth’s curved blue atmospheric horizon, city lights, stars and subtle Milky Way. Reference: approved exec-2bd31ff8-d98c-412e-bf2c-8abb52f9fe5a.png mock. Use clean raster scenery with live HTML text. Add slow orbital drift and gentle starlight, keep text steady and preserve EN/AR and presentation mode. This supersedes the coastal Muscat hero preference; Oman remains the case study. Respect reduced motion and pause animation offscreen or when the tab is hidden.

User selected Cinematic Night (second displayed concept), refined to a smooth, highly attractive website suitable as a hackathon presentation. Source visual: design-reference.png. Preserve authentic Oman night photography, deep navy, soft white, pale blue, editorial layouts, restrained motion, bilingual EN/AR, and presentation mode. Example data must stay separate from components and must never be described as verified live measurements.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

User requested crescent/star observing times using real data and GitHub/Vercel readiness. Preserve the planner's sourced astronomy, hourly forecast availability and next-day labels. Do not claim a guaranteed crescent sighting or invent future weather. GitHub target: ali-cs2/astra-team. Vercel output is dist/client; no environment variables are required.
