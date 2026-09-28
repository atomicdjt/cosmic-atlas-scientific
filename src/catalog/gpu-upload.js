function createImportedCatalogBundle(records = importedCatalogRecords, data = null) {
  const compact = data || prepareCatalogRenderData(records);
  return buildBufferBundle(compact.positions, compact.colors, compact.sizes);
}

function replaceImportedCatalogBundle(
  nextBundle,
  recordCount = importedCatalogRecords.length,
) {
  const previousBundle = importedCatalogBundle;
  importedCatalogBundle = nextBundle;
  document.body.classList.toggle("large-catalog", recordCount >= 5000);
  try {
    deleteBufferBundle(previousBundle);
  } catch (error) {
    // The new bundle is already active; a cleanup error must not roll the
    // catalog state back or turn a successful import into a reported failure.
    console.warn(
      "Could not release the previous imported catalog buffers.",
      error,
    );
  }
}

function rebuildImportedCatalogBundle() {
  const nextBundle = createImportedCatalogBundle();
  replaceImportedCatalogBundle(nextBundle);
}
