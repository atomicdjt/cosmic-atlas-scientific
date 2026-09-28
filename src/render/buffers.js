function buildBufferBundle(positions, colors, sizes) {
  const created = [];
  try {
    const vboPos = gl.createBuffer();
    if (!vboPos)
      throw new Error("WebGL could not allocate an imported catalog buffer.");
    created.push(vboPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vboCol = gl.createBuffer();
    if (!vboCol)
      throw new Error("WebGL could not allocate an imported catalog buffer.");
    created.push(vboCol);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const vboSize = gl.createBuffer();
    if (!vboSize)
      throw new Error("WebGL could not allocate an imported catalog buffer.");
    created.push(vboSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboSize);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);

    return { vboPos, vboCol, vboSize, count: positions.length / 3 };
  } catch (error) {
    created.forEach((buffer) => gl.deleteBuffer(buffer));
    throw error;
  }
}

function buildCatalogTierBundle(predicate) {
  const pos = [],
    col = [],
    size = [];
  CELESTIAL_CATALOG.filter(predicate).forEach((item) => {
    pos.push(item.pos[0], item.pos[1], item.pos[2]);
    const rgb = hexToRgb(item.color);
    col.push(rgb[0], rgb[1], rgb[2]);
    size.push(item.size * 3.2);
  });
  return buildBufferBundle(pos, col, size);
}
let observedCatalogBundle = buildCatalogTierBundle(
  (item) =>
    item.dataClass === "observational" || item.dataClass === "reference",
);
let contextCatalogBundle = buildCatalogTierBundle(
  (item) => item.dataClass === "context" || item.dataClass === "model",
);
