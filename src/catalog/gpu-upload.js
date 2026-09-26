function rebuildImportedCatalogBundle() {
  document.body.classList.toggle('large-catalog',importedCatalogRecords.length>=5000);
  deleteBufferBundle(importedCatalogBundle);
  const pos = [],
    col = [],
    size = [];
  filteredImportedRecords().forEach((item) => {
    pos.push(item.pos[0], item.pos[1], item.pos[2]);
    const rgb = hexToRgb(item.color);
    col.push(rgb[0], rgb[1], rgb[2]);
    size.push(item.size * (importedCatalogRecords.length > 20000 ? 0.8 : 1.4));
  });
  importedCatalogBundle = buildBufferBundle(pos, col, size);
}
