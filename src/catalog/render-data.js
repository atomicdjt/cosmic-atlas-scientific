// CPU render data is disposable; canonical records and raw provenance remain lossless.
function prepareCatalogRenderData(records, filter = catalogFilter) {
  const positions = new Float32Array(records.length * 3);
  const colors = new Float32Array(records.length * 3);
  const sizes = new Float32Array(records.length);
  let count = 0;
  for (const item of records) {
    if (!matchesCatalogFilter(item, filter)) continue;
    if (!item.pos || item.pos.length !== 3 ||
        !item.pos.every(v => Number.isFinite(Math.fround(v))) ||
        !Number.isFinite(Math.fround(item.size)))
      throw new Error("Imported record is outside supported render precision.");
    positions.set(item.pos, count * 3);
    colors.set(hexToRgb(item.color), count * 3);
    sizes[count++] = item.size * (records.length > 20000 ? 0.8 : 1.4);
  }
  return { positions: positions.subarray(0, count * 3),
    colors: colors.subarray(0, count * 3), sizes: sizes.subarray(0, count), count };
}
