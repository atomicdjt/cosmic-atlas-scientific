function createImportedCatalogBundle(records = importedCatalogRecords) {
  const pos = [],
    col = [],
    size = [];
  filteredImportedRecords(records).forEach((item) => {
    if (
      !item.pos ||
      item.pos.length !== 3 ||
      !item.pos.every((value) => Number.isFinite(Math.fround(value))) ||
      !Number.isFinite(Math.fround(item.size))
    ) {
      throw new Error("Imported record is outside supported render precision.");
    }
    pos.push(item.pos[0], item.pos[1], item.pos[2]);
    const rgb = hexToRgb(item.color);
    col.push(rgb[0], rgb[1], rgb[2]);
    size.push(item.size * (records.length > 20000 ? 0.8 : 1.4));
  });
  return buildBufferBundle(pos, col, size);
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
