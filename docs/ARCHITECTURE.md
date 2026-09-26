# Architecture

## Distribution architecture

The v4 distribution intentionally has two faces:

1. **Standalone product** — one HTML file containing CSS, UI, shaders, scientific core data, renderer, and interaction logic. It can be copied to a phone/computer and opened offline.
2. **Structured engineering package** — canonical data, schema, provenance manifest, ingestion tools, tests, and documentation. This is the handoff boundary for future Codex/Work development.

The standalone file is therefore a *build artifact with source retained*, not an opaque binary.

## Runtime layers

### Data model

`CELESTIAL_CATALOG` contains the curated embedded core. Runtime imports are normalized into `importedCatalogRecords`; their GPU attributes are rebuilt into a dedicated buffer. Imported records never overwrite the curated core.

### Scientific transforms

- ICRS RA/Dec -> observer-centered Cartesian direction.
- Piecewise nonlinear radial transform -> navigable scene radius.
- ICRS -> Galactic `(l,b)` rotation matrix for inspector output.
- Flat-LCDM numerical lookup -> model redshift/lookback/comoving distance relationships.

### Rendering

The WebGL renderer maintains separate GPU buffers for:

- curated scientific catalog,
- imported catalog,
- contextual catalog,
- local procedural stars,
- Milky Way procedural particles,
- Local Group procedural textures,
- cosmic-web procedural particles,
- distance rings,
- CMB sphere.

This separation lets the UI switch scientific vs contextual layers without mutating data.

### Interaction

- orbital camera with eased scale transitions,
- touch drag and pinch zoom,
- desktop mouse/wheel input,
- catalog search and focus,
- screen-projected object picking,
- mobile inspector/telemetry panels,
- guided scale tour,
- two-target measurement,
- local catalog import/export.

For imported catalogs above 5,000 rows, brute-force click picking is intentionally not extended across all imported points. A future modular version should use a spatial index or GPU picking pass.

## Offline/security model

The standalone application contains no external `<script src>`, stylesheet link, or runtime `fetch()` call. Imported JSON is read locally through the browser File API. Source links in the provenance panel open only when the user explicitly activates them.

## Performance model

Large static point sets are stored in WebGL buffers rather than individual DOM nodes. Imported records are capped at 50,000 per local load in v4. The data table renders a maximum of 1,200 rows at once to remain usable on mobile.

## Future modularization

See `FUTURE_REPOSITORY_LAYOUT.md`. The key design requirement is to keep the **one-file artifact as a generated release target** even after development moves to modular JS/CSS/data files.
