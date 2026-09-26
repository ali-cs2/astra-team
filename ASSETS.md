# ASTRA image assets

Current factual imagery: `public/images/observations/muscat-2012.webp` and `muscat-2016.webp` serve the location and case-study sections. The comparison uses the wider `northern-oman-2012.webp` and `northern-oman-2016.webp` crops (911 × 317 pixels). These images and `public/map-tiles-night/2012/` and `2016/` are actual NASA GIBS VIIRS Black Marble imagery. Geographic mosaic/crop provenance is in `public/data/imagery-provenance.json`. The space hero stays decorative art; older Oman artwork below is retained as unused history. See `DATA-SOURCES.md`.

Generation mode: built-in Image Gen. All project assets are saved locally; no CLI/API key workflow was used.

## Approved space hero update

- Active asset: `public/images/hero/earth-orbit.webp` (1672 × 941). Generated with the built-in Image Gen editing tool from the approved space mock; previous Muscat asset remains available.
- Prompt: Extract/recreate only the cinematic background. Remove all text, logo, navigation, buttons and bottom tool strip. Preserve deep navy starfield, subtle Milky Way on right, curved Earth horizon from lower left to mid-right, thin blue atmospheric rim, clouds and warm city lights. Leave quiet dark space for live HTML text. No extra planets, flare, UI or watermark.
- Animation: slow 48-second alternating camera drift; 9-second subtle screen-blended starlight using the same aligned raster with a sky mask. No generated dots or screenshot UI. Text stays still. Motion pauses when offscreen/hidden and respects reduced-motion preferences.
- Generation original: `C:/Users/LENOVO/.codex/generated_images/01a0dcbd-8d55-75c1-80c3-d62b84249034/exec-28aac785-aca0-4031-a66d-7e4e5433bc20.png`.

## Art direction / prompt set

1. **Cinematic Muscat hero:** photorealistic Oman-inspired coastal night landscape, rugged Hajar mountains in the foreground, amber coastal settlement lights across the horizon, calm Gulf water on the right, restrained starry dark-blue sky with clear space on the left for interface text. Match the selected Cinematic Night mock. No text, UI, logos, astronauts, planets, or neon.
   - UI asset: `public/images/hero/muscat-night.webp` (1672 × 941, optimized).
   - Generated original: `public/images/hero/muscat-night.png`.
2. **Urban-sky comparison:** 1600 × 700 realistic Oman-inspired mountain/coastal horizon, settlement lights, amber artificial skyglow and few visible stars. Same visual direction as the selected mock's comparison strip. No text or interface.
   - UI asset: `public/images/night-sky/urban-sky.webp`.
3. **Responsible-sky comparison:** edit the urban image; preserve the exact mountain skyline, coastline, camera, and scene. Reduce city glow and the urban light dome; darken the sky to blue and reveal more natural faint stars. No added text, planets, or fantasy sky.
   - UI asset: `public/images/night-sky/responsible-sky.webp` (1600 × 700).

Images are illustrative, rather than verified location photographs. Replace the named WebP files with supplied images as described in README.

The geographic map uses real NASA GIBS Blue Marble terrain imagery, cached under `public/map-tiles-nasa/` and attributed in the interface. This is a geographic basemap, not a measured light-pollution layer. Local example GeoJSON is kept separately in `src/data/lightPollution.json`.
