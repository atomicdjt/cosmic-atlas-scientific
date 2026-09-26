function unitFromRaDec(raDeg, decDeg) {
  const ra = (raDeg * Math.PI) / 180.0;
  const dec = (decDeg * Math.PI) / 180.0;
  return [
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    Math.cos(dec) * Math.sin(ra),
  ];
}

function normalizeVec3(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / m, v[1] / m, v[2] / m];
}

function crossVec3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function physicalVectorToScene(vLy) {
  const d = Math.hypot(vLy[0], vLy[1], vLy[2]);
  if (d <= 0) return [0, 0, 0];
  const r = distToSceneRadius(d);
  return [(r * vLy[0]) / d, (r * vLy[1]) / d, (r * vLy[2]) / d];
}
