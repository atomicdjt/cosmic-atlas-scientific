# Maintained source

`modules.json` orders 53 classic JavaScript modules. Edit these modules, `app/shell.html` and `styles/app.css`; regenerate both distributions with `python scripts/build_v5.py`. The monolithic `Cosmic_Atlas_v4_source.html` is historical and remains untouched.

`catalog/render-data.js` defines the compact typed-array staging interface. `catalog/import.js` owns cancellable jobs and atomic catalog commits. The worker embeds the same pure normalization functions as the fallback, streams at most three pending batches of 1,000 records and transfers render buffers. `gpu-upload.js` owns buffer replacement. Scientific records remain lossless and distinct from disposable render arrays. `stageCoreFilteredBundles` / `commitCoreFilteredBundles` stage filter updates; epoch display also stages before changing canonical record references.

`ui/accessibility.js` supplies the common dialog lifecycle. `interaction/spatial-index.js` builds a settled-view grid in slices and rejects stale camera/viewport/catalog/filter/layer state; a cold pick scans once and caches a local candidate neighborhood. Classic modules still share lexical state; this is a targeted interface improvement, not full component isolation.
