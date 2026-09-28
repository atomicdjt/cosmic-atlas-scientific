const localPos = [],
  localCol = [],
  localSize = [];
for (let i = 0; i < 1500; i++) {
  const u = rand(),
    v = rand();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const dLy = Math.pow(rand(), 0.5) * 100.0;
  const r = distToSceneRadius(dLy);
  localPos.push(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta) * 0.6,
    r * Math.cos(phi),
  );
  const spec = rand();
  let rgb;
  if (spec < 0.7) rgb = [1.0, 0.52, 0.33];
  else if (spec < 0.88) rgb = [1.0, 0.87, 0.6];
  else rgb = [0.7, 0.83, 1.0];
  localCol.push(rgb[0], rgb[1], rgb[2]);
  localSize.push(2.5 + rand() * 2.0);
}
const localStarsBundle = buildBufferBundle(localPos, localCol, localSize);

// Milky Way geometry is built in physical light-year coordinates around
// Sagittarius A*, then transformed into the observer-centered logarithmic scene.
// This keeps the Sun off-center instead of incorrectly placing it at the disk core.
const mwPos = [],
  mwCol = [],
  mwSize = [];
const numArms = 4,
  armWinding = 3.65;
const galacticCenterDistanceLy = 26670.0;
const galacticCenterDir = unitFromRaDec(266.41683, -29.00781);
const galacticCenterPhysical = galacticCenterDir.map(
  (v) => v * galacticCenterDistanceLy,
);
const galacticNorth = normalizeVec3(unitFromRaDec(192.85948, 27.12825));
const gcToSun = normalizeVec3(galacticCenterDir.map((v) => -v));
const galacticTangent = normalizeVec3(crossVec3(galacticNorth, gcToSun));

for (let i = 0; i < 30000; i++) {
  const t = Math.pow(rand(), 1.75);
  const radiusLy = 250 + t * 54750;
  const arm = (i % numArms) * ((2 * Math.PI) / numArms);
  const spiralAngle = Math.log1p(radiusLy / 1800.0) * armWinding + arm;
  const spread = (rand() - 0.5) * (0.34 + (radiusLy / 55000) * 0.55);
  const angle = spiralAngle + spread;
  const diskHeightLy = 900.0 * Math.exp(-radiusLy / 26000.0) + 120.0;
  const zLy = (rand() - 0.5 + rand() - 0.5) * diskHeightLy;
  const xLy = radiusLy * Math.cos(angle);
  const yLy = radiusLy * Math.sin(angle);

  const physical = [
    galacticCenterPhysical[0] +
      gcToSun[0] * xLy +
      galacticTangent[0] * yLy +
      galacticNorth[0] * zLy,
    galacticCenterPhysical[1] +
      gcToSun[1] * xLy +
      galacticTangent[1] * yLy +
      galacticNorth[1] * zLy,
    galacticCenterPhysical[2] +
      gcToSun[2] * xLy +
      galacticTangent[2] * yLy +
      galacticNorth[2] * zLy,
  ];
  const scene = physicalVectorToScene(physical);
  mwPos.push(scene[0], scene[1], scene[2]);

  const bulgeFactor = Math.max(0, 1.0 - radiusLy / 15000);
  let rgb;
  if (bulgeFactor > 0.4) {
    rgb = [1.0, 0.78, 0.42];
  } else {
    const rnd = rand();
    if (rnd < 0.25) rgb = [1.0, 0.47, 0.67];
    else if (rnd < 0.7) rgb = [0.55, 0.76, 1.0];
    else rgb = [1.0, 1.0, 1.0];
  }
  mwCol.push(rgb[0], rgb[1], rgb[2]);
  mwSize.push(2.2 + rand() * 2.5);
}
const mwBundle = buildBufferBundle(mwPos, mwCol, mwSize);

const lgPos = [],
  lgCol = [],
  lgSize = [];
function addSpiralGalaxyPoints(center, radScene, count, tiltRad, baseRgb) {
  for (let i = 0; i < count; i++) {
    const radFrac = Math.pow(rand(), 1.5);
    const r = radFrac * radScene;
    const spiral = rand() * Math.PI * 2 + Math.log(r + 1.0) * 3.0;
    let lx = r * Math.cos(spiral);
    let ly = (rand() - 0.5) * (radScene * 0.15 * (1.0 - radFrac));
    let lz = r * Math.sin(spiral);

    const ty = ly * Math.cos(tiltRad) - lz * Math.sin(tiltRad);
    const tz = ly * Math.sin(tiltRad) + lz * Math.cos(tiltRad);

    lgPos.push(center[0] + lx, center[1] + ty, center[2] + tz);
    let rgb = radFrac < 0.25 ? [1.0, 0.86, 0.67] : baseRgb;
    lgCol.push(rgb[0], rgb[1], rgb[2]);
    lgSize.push(2.4 + rand() * 2.0);
  }
}
const andromedaCoord = astronomicalToCartesian(10.68, 41.27, 2540000.0);
addSpiralGalaxyPoints(andromedaCoord, 22.0, 6500, 1.34, [0.8, 0.89, 1.0]);

const triangulumCoord = astronomicalToCartesian(23.46, 30.66, 2730000.0);
addSpiralGalaxyPoints(triangulumCoord, 12.0, 2500, 0.9, [0.64, 0.83, 1.0]);

const localGroupBundle = buildBufferBundle(lgPos, lgCol, lgSize);

const filPos = [],
  filCol = [],
  filSize = [];
const clusterNodes = [
  astronomicalToCartesian(186.75, 12.72, 54000000.0),
  astronomicalToCartesian(243.8, -60.8, 220000000.0),
  astronomicalToCartesian(194.95, 27.98, 321000000.0),
  astronomicalToCartesian(202.5, -31.5, 650000000.0),
  astronomicalToCartesian(190.0, 5.0, 1200000000.0),
];

for (let i = 0; i < 32000; i++) {
  let px, py, pz;
  if (i < 14000) {
    const nA = clusterNodes[Math.floor(rand() * clusterNodes.length)];
    const nB = clusterNodes[Math.floor(rand() * clusterNodes.length)];
    const alpha = rand();
    const jRad = (1.0 - Math.abs(alpha - 0.5) * 1.5) * 22.0 + 3.0;
    px = nA[0] + (nB[0] - nA[0]) * alpha + (rand() - 0.5) * jRad;
    py = nA[1] + (nB[1] - nA[1]) * alpha + (rand() - 0.5) * jRad;
    pz = nA[2] + (nB[2] - nA[2]) * alpha + (rand() - 0.5) * jRad;
  } else {
    const dLy = 250000000 + Math.pow(rand(), 1.6) * 35000000000;
    const r = distToSceneRadius(dLy);
    const theta = rand() * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * rand() - 1.0);
    px = r * Math.sin(phi) * Math.cos(theta);
    py = r * Math.sin(phi) * Math.sin(theta);
    pz = r * Math.cos(phi);
  }
  filPos.push(px, py, pz);

  const pDist = Math.hypot(px, py, pz);
  const dLyApprox = sceneRadiusToDist(pDist);
  const z = distToRedshift(dLyApprox);
  let rgb;
  if (z < 0.05) rgb = [0.25, 0.83, 1.0];
  else if (z < 0.5) rgb = [0.54, 0.72, 1.0];
  else if (z < 1.5) rgb = [1.0, 0.82, 0.46];
  else if (z < 4.0) rgb = [1.0, 0.52, 0.27];
  else rgb = [1.0, 0.2, 0.33];
  filCol.push(rgb[0], rgb[1], rgb[2]);
  filSize.push(2.5 + rand() * 2.0);
}
const filamentsBundle = buildBufferBundle(filPos, filCol, filSize);
