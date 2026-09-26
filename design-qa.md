# ASTRA design and interaction QA

final result: passed

## Comparison target and evidence

- Source visual truth: `design-reference.png`, the selected refined Cinematic Night design.
- State: English homepage at scroll position 0, comparison slider 50%, normal navigation, demo closed, presentation off.
- CSS viewport: 1440 × 1024, device pixel ratio approximately 1.
- Source pixels: 1487 × 1058. Browser screenshot pixels: 1425 × 1013. Both normalized to 1440 × 1024 for comparison; browser capture excludes the scrollbar and applies a small capture-scale difference.
- Browser-rendered final implementation: `qa/desktop-final.png`.
- Full-view comparison: `qa/comparison-final.jpg` contains source and implementation together.
- Focused hero/type comparison: `qa/typography-comparison.jpg`.
- Additional browser evidence: `qa/presentation-1366.png`, `qa/present-map-1366.png`, `qa/present-improve-1366.png`, `qa/present-science-1366.png`, `qa/desktop-1920.png`, `qa/mobile-ar.png`, `qa/mobile-en.png`, and `qa/demo-improve.png`.

## Findings and comparison history

### Initial comparison — blocked

1. **[P2] Problem comparison started too far below the fold.** Initial source/browser comparison in `qa/comparison-initial.jpg` showed excessive section spacing and too tall a comparison image. Reduced the first problem-section padding, removed its redundant normal-view eyebrow, aligned the container margins, and reduced normal comparison height. Final combined image shows the problem headline and comparison directly beneath the tool strip.
2. **[P2] Hero typography lacked the target's optical weight.** Increased Manrope headline weight to 600 and slightly increased desktop size. The focused comparison confirms a strong two-line headline and intact CTAs. The generated mock's precise glyph shapes remain an expected font approximation.
3. **[P1] Basemap tile service returned an API-key-required raster.** Replaced the basemap with locally cached NASA GIBS Blue Marble terrain imagery, preserved visible attribution, bounded the supported Oman region, and verified all rendered tiles load. Obsolete tiles are archived outside public assets. `qa/present-map-1366.png` confirms geographic terrain and coastline instead of a service message.
4. **[P1] Canvas renderer scheduled work after React StrictMode cleanup.** Changed Leaflet rendering to its SVG renderer. No handcrafted SVG artwork is used; geographic paths are rendered by the mapping library from local data. Subsequent map mounting, selections, demo reopening, and viewport changes produced no new runtime errors.
5. **[P1] Reveal class could leave sections hidden after hot updates/navigation.** Made content visible by default and limited reveals to brief progressive-enhancement animation. Reloaded and traversed every presentation stop; no blank sections remain.
6. **[P2] Duplicate source-selector IDs broke the modal's accessible label.** Used React `useId` for each instance. Retested the demo selector: Sharqiyah Sands produces 12/27/8/44/9 source contributions and the map follows the selected site.
7. **[P2] Presentation map exceeded the 768px laptop height.** Shortened its heading, reduced presentation-only location panel spacing, and removed the hidden navigation's scroll offset. All ten stops use 768px minimum sections; the map content and controls fit above the presentation toolbar once navigation settles.

### Post-fix comparison — passed

No actionable P0/P1/P2 findings remain. The combined final comparison preserves the cinematic image hierarchy, headline placement, pale-blue primary action, three-tool strip, dark editorial surface, and sky comparison.

## Required fidelity surfaces

- **Fonts/typography:** Locally bundled Manrope and Inter match the clean sans-serif direction. Noto Sans Arabic renders Arabic text without broken joining. Headline, support text, labels, and scores retain distinct hierarchy. Two-line hero wrapping remains intact on desktop and mobile.
- **Spacing/layout:** Hero, CTA group, tool strip, and first comparison follow the selected composition. Responsive layouts stack tools, controls, case steps, and map panels without horizontal overflow. Desktop tested at 1366 × 768, 1440 × 1024, and 1920 × 1080; mobile tested at 390 × 844.
- **Colors/tokens:** Deep navy, soft white, pale blue, restrained amber pollution, and muted teal improvement colors match the target. Active, focus, and disabled states are visible. Gradients serve photographic text readability, not decorative substitute artwork.
- **Image quality/assets:** Individual generated Oman-inspired landscape assets are local, sharp, compressed WebP files. The bright/dark pair preserves the same horizon. NASA terrain supplies geographic context; it is separate from illustrative pollution values. Standard icons come from Phosphor.
- **Copy/content:** All major English and Arabic interface text is coherent. Estimated values and case-study context are clear. Source references describe the future methodology without claiming a completed scientific engine or live measurements. No template marketing, upload, account, or empty-data messaging remains.

## Functional verification

- Primary navigation, hero CTAs, tool-strip links, footer presentation action, mobile menu, and final demo CTA.
- Map zoom, location selection, location information, and pollution-layer toggle.
- Site recommendation selection and four explanatory suitability factors.
- Source location selection and contributor selection update geographic connections and contributions.
- Comparison slider: keyboard and accessibility value-setting; verified maximum 96% and restored the final 50% state.
- Default lighting scenario: **54 → 68**, **+26%**, **−22%**.
- Full shielding and curfew with other default controls: **73**, **+35%**, **−29%**.
- Unchanged baseline (100% intensity, no shielding, all-night, cool): **54**, **0%**, **0%**.
- Reset restores defaults and clears applied results. Pending changes require applying the scenario.
- Demo Observe/Sources/Improve tabs, linked location context, responsive scrolling, close action, Escape behavior, and modal focus boundary.
- Muscat case-study tabs and previous/next controls; fifth step displays scenario sky quality 68.
- Research disclosure opens and closes, with published study links.
- Presentation on-screen controls, all ten stops, keyboard advance, and exit; inputs, map controls, and tabs retain their own keyboard behavior.
- EN/AR switching, Arabic RTL text, natural map orientation, and mobile navigation.
- No broken rendered image assets at the 1920px check; no horizontal overflow in any of the ten sections at the Arabic mobile check.
- Console errors checked: historical pre-fix Canvas errors are recorded above; no new errors in the subsequent SVG-renderer verification window.
- TypeScript check and production build completed successfully.

## Follow-up polish and limits

- [P3] Generated imagery is art-directed illustration, not documentary photography; supplied Oman photographs can replace it without changing layout.
- [P3] Exact type glyphs and photographic crop differ slightly from the generated visual reference; the selected hierarchy and overall composition are preserved.
- Touch behavior was exercised through responsive browser controls, not a physical phone. Projector readability was assessed at the requested resolutions, not on physical projection equipment.
- No deployment, real scientific calibration, or end-user data integration was part of this prototype.

## Implementation checklist

- [x] Complete page and focused demo
- [x] Separate example data and local imagery
- [x] Functional map, recommendations, sources, and simulator
- [x] Muscat presentation story and science references
- [x] Keyboard presentation and bilingual responsive layouts
- [x] Browser interaction and visual QA
- [x] Local run instructions in README

## Approved space hero follow-up — passed

Scope: replace the coastal hero with the subsequently approved Earth / stars concept and restrained animation. All other content and tools retain the prior validated layout.

- Clean Image Gen raster preserves the diagonal blue Earth rim, nighttime city lights, dark title space and right-side Milky Way. Navigation and title are live HTML; no baked screenshot UI.
- Reviewed desktop at 1440 × 1024, presentation at 1366 × 768, and Arabic mobile at 390 × 844. Earth remains visible, text is legible, and Arabic mobile has no horizontal overflow.
- Runtime style inspection confirmed orbital animation running with a changing transform. Navigating to the map confirmed `animation-play-state: paused` when the hero leaves the viewport. Reduced-motion handling and visibility listener reviewed in code.
- Hero map CTA still navigates correctly, presentation navigation works, and no browser console errors were captured.
- TypeScript and production build passed.
- Evidence: `qa/space-desktop.png`, `qa/space-presentation.png`, `qa/space-mobile-ar.png`, and side-by-side `qa/space-reference-comparison.png`.
- Intentional scope differences: existing typography, navigation and buttons remain consistent with the built product; standard hero is shorter than the concept image, while presentation expands to the viewport. The image crop adapts accordingly.

## Real-source migration — passed

User asked to replace every factual example with real attributable sources and APIs. The illustrative-score checks above are historical and superseded.

- Live Open-Meteo API request succeeded inside the browser. Muscat: 0% forecast clouds, 52% relative humidity, 25.4 km visibility, model elevation 12 m. Jebel Akhdar: 0% clouds, 19% relative humidity, 30.1 km visibility, elevation 1,942 m. These are the 2026-09-26 20:00 GST forecast values seen during QA, not permanent expected values.
- Site selection updates actual forecast metrics; source status, receipt time, requested night, units and attribution are visible. A refresh makes a new shared request. Null / expired values stay missing, unit and coordinate mismatches are rejected, and normalized responses retain metadata across a local cache round-trip. Offline fallback was reviewed and the cache/expired-hour logic tested; browser network failure was not artificially forced.
- Actual NASA VIIRS Black Marble imagery cached successfully: 116 tiles covering both 2012 and 2016. Map layer toggle and geographic selection work. Every map states the historical year and does not call display imagery an SQM measurement.
- Nominatim responses yielded 5 real OSM objects. Selecting Jebel Akhdar showed Nizwa 20.9 km and Seeb 85.0 km, using geographic reference points and spherical straight-line distances; no causal attribution percentages remain.
- Published Tucson result toggles between −5.4 ± 0.9% near the centre and −3.6 ± 0.9% at the adjacent suburban site. The result stays tied to Tucson; no fake skyglow repaint or Oman forecast is derived from it. Case-study source link and the Tucson location label were verified.
- Desktop, all 3 demo tabs, and 1366 × 768 presentation map checked. The presentation map, location buttons and data note fit above the fixed navigation controller. Arabic 390 × 844 has no horizontal overflow in any of the ten sections.
- TypeScript check, production build, 7 data checks, and 4 hosting-worker checks passed.
- Evidence: `qa/real-map-desktop.png`, `qa/real-experiment-desktop.png`, `qa/real-presentation-map.png`, `qa/real-mobile-ar.png`.
- Scientific limits are deliberately visible: no ground SQM sensor, current calibrated satellite radiance, overall suitability score, or municipality source-share model is connected. Weather forecasts, historical imagery, geographic distances and published ground measurements are kept distinct.

## Wider geographic comparison — passed

- Rebuilt both NASA crops from the same zoom-8 cached tiles and identical bounds: 55.5–60.5°E, 22.4–24.0°N (911 × 317 pixels).
- Comparison preserves the full region with contain sizing, a maximum 960px container and compact mobile sizing.
- Desktop, 1366 × 768 presentation and 390 × 844 mobile inspected. Comparison stays within the mobile viewport; presentation fits above its controller. Slider keyboard input changed 50 to 51 and back.
- Production build passed. Evidence: qa/comparison-region-desktop.png, qa/comparison-region-mobile.png, qa/comparison-region-presentation.png.

## Interactive Improve — passed

- One shared location now drives map, observing, sources, Improve and the demo. Selecting Jebel Akhdar in the Sources control updated Improve to the same site with its actual live forecast (0% clouds, 19% humidity, 30.1 km visibility during QA).
- Sliders update power bars and calculated affected-fixture reduction immediately. Equal before/after gave 0%; after zero gave 100%; reducing before to 1% stayed valid. Reset restored 90% to 30% and 66.7%.
- Published Tucson reference stays separate from the editable power calculation; selecting the suburban reference changes only the measured result to 3.6 ± 0.9%. No local sky-brightness response is invented.
- 1366 × 768 presentation fits the controls above the navigation. Arabic mobile at 390 × 844 has no horizontal overflow (375px content and scroll width). Demo retains Jebel Akhdar when switching to Improve and its slider updates immediately.
- TypeScript, production build and 7 existing data tests passed. Evidence: qa/interactive-improve-presentation.png and qa/interactive-improve-mobile-ar.png.

## Observing planner and Vercel readiness — passed

- Astronomy Engine 2.1.19 computes site/date-specific geometry. A full-Moon evening gives no waxing crescent window; the next-conjunction button selects 2026-10-11 during this QA. Muscat displayed a calculated crescent attempt at 17:51 GST, sunset 17:44 and moonset 18:00, explicitly without a visibility classification or weather beyond the forecast period.
- Star recommendation uses full astronomical darkness, Moon-free hour preference and real forecast cloud cover. Five astronomy tests cover phase/geometry constraints, one-hour darkness, cloud ranking, stale data, dates and location changes. Seven data and four hosting tests also pass.
- Arabic 390 × 844 has no horizontal overflow. Presentation at 1366 × 768 contains the planner above the fixed controller. Evidence: qa/planner-presentation.png and qa/planner-mobile-ar.png.
- Clean npm ci and production build passed after stopping the local server to release its Windows esbuild file lock; preview restarted on 4173. npm audit reports zero vulnerabilities after patch updates. vercel.json selects Vite, npm run build, dist/client and SPA fallback. Build includes TypeScript validation; no secrets or environment variables are required. Vercel itself has not been deployed.
