// ICRS vectors are the canonical exchange frame. Rendering transforms are
// deliberately separate so a visual orientation is never exported as a frame.
const FRAME_CONTRACT = Object.freeze({
  canonical: "ICRS",
  render: "Sol-centered display coordinates",
  observerOutput: "topocentric horizontal (approximate; refraction optional)",
});

function dotVec3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function subtractVec3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }

function icrsRaDecToUnitVector(raDeg, decDeg) {
  return unitFromRaDec(raDeg, decDeg);
}

function angularSeparationFromVectors(a, b) {
  const an = normalizeVec3(a), bn = normalizeVec3(b);
  return Math.acos(Math.max(-1, Math.min(1, dotVec3(an, bn)))) * 180 / Math.PI;
}
