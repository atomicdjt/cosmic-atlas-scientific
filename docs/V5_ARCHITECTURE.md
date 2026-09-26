# v5 architecture and migration

Cosmic Atlas v5 evolves the v4 renderer and visual identity. It is not a replacement implementation. The untouched v4 tree is tagged `v4.0.0-baseline`; the original input ZIP is retained with the release.

## Source and build

`src/modules.json` is the explicit load-order contract for 52 classic JavaScript source modules. Pure astronomy, cosmology, units, uncertainty, epoch propagation, photometry, normalization and measurement functions are separate from DOM and WebGL code. UI, camera/touch/keyboard, GPU buffers, shaders, particles, lines, CMB and picking have distinct files. `src/styles/app.css` and `src/app/shell.html` are editable sources.

The dependency-free Python build in `scripts/build_v5.py` concatenates these files without a runtime loader and embeds a compact copy of the Gaia 5k catalog. It emits `dist/Cosmic_Atlas_Standalone.html` and an ordered-script development edition. It checks Node syntax, DOM identifiers, literal DOM references, external dependency patterns and unseeded randomness. Repeated builds from the same inputs must be byte-identical.

Classic scripts intentionally retain shared lexical state to preserve v4 behavior. These are maintained source boundaries, not fully isolated ES modules. Further encapsulation is possible without replacing the standalone distribution contract. The historical `src/Cosmic_Atlas_v4_source.html` is never the v5 build input.

## Data flow

Saved upstream bytes → reproducible Python normalization → versioned JSON plus manifest → local file or embedded JSON → inline worker parsing → chunked normalization → retained canonical source record plus display state → typed WebGL buffers.

There are no runtime data requests. A Blob worker runs the embedded parser; it does not download code. Normalization yields between groups of 1,000 rows, rejects invalid coordinates and unsafe numeric identifiers, enforces explicit angular-only records, and rejects duplicate normalized IDs before replacing the active catalog. Failed imports preserve the previous catalog. At most 100,000 records are accepted; 50,000 real Gaia rows were the largest evaluated tier.

Source fields remain in `raw` and `raw_source_fields`. Epoch propagation changes display coordinates only. Export preserves the original source coordinates and labels propagated coordinates separately. JSON export retains catalog-level acquisition metadata and active filters; CSV retains nested source columns as JSON strings. Filters affect atlas buffers, table, search, diagram and exports. Imported catalogs replace the previous imported layer rather than accumulating it.

## Rendering and performance

GPU buffers remain batched by scientific versus illustrative role. Dense catalog point size is capped, procedural geometry is seeded, expensive outer-scale layers are gated by camera scale, and dense catalogs disable backdrop blur. Mobile render DPR is capped at 1.5; desktop at 2. HUD updates are throttled to roughly 150 ms.

Picking uses a 56-pixel screen grid. The first click after view/filter/catalog changes builds the grid in O(n); subsequent clicks in the identical view inspect adjacent cells. There is no per-frame O(n) catalog projection scan. Continuous camera rotation invalidates the cache, so a moving-view click still incurs the build cost. No GPU picking claim is made.

The table sorts and filters the data but creates at most 100 DOM rows per page. The linked diagram is an uncorrected Gaia color–absolute-magnitude display, not a calibrated stellar-evolution analysis. Every source remains accessible via search/table even when diagram points overlap.

## Portability and limitations

Python and Node are development/test tools only. JSON Schema validation and Playwright are development dependencies. No Node package, API key, account, service, CDN, analytics or database is required to open the generated standalone file. Source links require a deliberate user click.

Headless mobile emulation is not physical phone validation. GPU upload timing records CPU submission time, not a hardware timer-query measurement. Browser heap readings may be coarse or unavailable and exclude GPU/process memory. Runtime source boundaries still share state. WebGL context loss is reported with a reload instruction; automatic GPU-resource restoration is not implemented.
