const ringVerts = [];
const distanceList = [
  10, 100, 1000, 26670, 100000, 2540000, 54000000, 500000000, 1000000000,
  10000000000, 46500000000,
];
const ringRanges = [];
let startIdx = 0;

distanceList.forEach((d) => {
  const r = distToSceneRadius(d);
  const segs = 90;
  for (let i = 0; i <= segs; i++) {
    const theta = (i / segs) * Math.PI * 2;
    ringVerts.push(r * Math.cos(theta), 0, r * Math.sin(theta));
  }
  ringRanges.push({ start: startIdx, count: segs + 1, d: d });
  startIdx += segs + 1;
});

const vboRings = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vboRings);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringVerts), gl.STATIC_DRAW);
