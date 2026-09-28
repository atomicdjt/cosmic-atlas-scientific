// Rebuild screen grid on click only, cached by view/revision; no per-frame catalog scan.
class ScreenGrid {
  constructor(cellSize = 56) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }
  build(records, project) {
    this.cells.clear();
    for (const item of records) {
      const p = project(item.pos);
      if (!p) continue;
      const key =
        Math.floor(p[0] / this.cellSize) +
        "," +
        Math.floor(p[1] / this.cellSize);
      if (!this.cells.has(key)) this.cells.set(key, []);
      this.cells.get(key).push({ item, p });
    }
  }
  nearest(x, y, radius = 28) {
    let best = null,
      d = radius;
    const cx = Math.floor(x / this.cellSize),
      cy = Math.floor(y / this.cellSize);
    for (let a = cx - 1; a <= cx + 1; a++)
      for (let b = cy - 1; b <= cy + 1; b++)
        for (const e of this.cells.get(a + "," + b) || []) {
          const dd = Math.hypot(x - e.p[0], y - e.p[1]);
          if (dd < d) {
            d = dd;
            best = e.item;
          }
        }
    return best;
  }
}
const pickGrid = new ScreenGrid();
let pickSignature = "";
function pickAt(x, y) {
  const sig =
    Array.from(matMVP).join(",") +
    ":" +
    catalogRevision +
    ":" +
    JSON.stringify(layers) +
    ":" +
    JSON.stringify(catalogFilter);
  if (sig !== pickSignature) {
    pickGrid.build(
      visibleScientificRecords().filter((i) =>
        i.imported
          ? layers.imported
          : ["context", "model"].includes(i.dataClass)
            ? layers.context
            : layers.catalog,
      ),
      projectToScreen,
    );
    pickSignature = sig;
  }
  return pickGrid.nearest(x, y);
}
