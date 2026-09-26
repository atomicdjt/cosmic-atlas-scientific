// --- Cosmology model -------------------------------------------------------
// Flat Planck-like ΛCDM approximation. Distances are present-day comoving
// distances. A log(1+z) lookup keeps the render loop fast while making
// redshift/lookback telemetry physically coherent across cosmic scales.
const COSMO = Object.freeze({
  H0: 67.4, // km/s/Mpc
  omegaM: 0.315,
  omegaR: 9.2e-5,
  omegaL: 1.0 - 0.315 - 9.2e-5,
  cKmS: 299792.458,
  mpcToLy: 3.261563777e6,
  zMax: 1.0e7,
  samples: 4096,
});

function expansionE(z) {
  const zp1 = 1.0 + z;
  return Math.sqrt(
    COSMO.omegaR * Math.pow(zp1, 4) +
      COSMO.omegaM * Math.pow(zp1, 3) +
      COSMO.omegaL,
  );
}

function buildCosmologyTable() {
  const rows = [{ z: 0, distLy: 0, lookbackYr: 0 }];
  const xMax = Math.log1p(COSMO.zMax);
  const dx = xMax / COSMO.samples;
  const hubbleDistanceMpc = COSMO.cKmS / COSMO.H0;
  const hubbleTimeGyr = 3.0856775814913673e19 / COSMO.H0 / 31557600 / 1e9;
  let intDistance = 0.0;
  let intLookback = 0.0;
  let prevDistanceIntegrand = 1.0 / expansionE(0);
  let prevLookbackIntegrand = 1.0 / expansionE(0);

  for (let i = 1; i <= COSMO.samples; i++) {
    const x = i * dx;
    const z = Math.expm1(x);
    const e = expansionE(z);
    // dz = exp(x) dx; lookback integrand cancels the (1+z) term.
    const distanceIntegrand = Math.exp(x) / e;
    const lookbackIntegrand = 1.0 / e;
    intDistance += 0.5 * (prevDistanceIntegrand + distanceIntegrand) * dx;
    intLookback += 0.5 * (prevLookbackIntegrand + lookbackIntegrand) * dx;
    rows.push({
      z,
      distLy: intDistance * hubbleDistanceMpc * COSMO.mpcToLy,
      lookbackYr: intLookback * hubbleTimeGyr * 1.0e9,
    });
    prevDistanceIntegrand = distanceIntegrand;
    prevLookbackIntegrand = lookbackIntegrand;
  }
  return rows;
}

const COSMO_TABLE = buildCosmologyTable();
const MODEL_MAX_LY = COSMO_TABLE[COSMO_TABLE.length - 1].distLy;

function interpolateCosmologyByDistance(dLy) {
  if (dLy <= 0) return COSMO_TABLE[0];
  if (dLy >= MODEL_MAX_LY) return COSMO_TABLE[COSMO_TABLE.length - 1];
  let lo = 0,
    hi = COSMO_TABLE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (COSMO_TABLE[mid].distLy < dLy) lo = mid;
    else hi = mid;
  }
  const a = COSMO_TABLE[lo],
    b = COSMO_TABLE[hi];
  const t = (dLy - a.distLy) / Math.max(1e-9, b.distLy - a.distLy);
  return {
    z: a.z + (b.z - a.z) * t,
    distLy: dLy,
    lookbackYr: a.lookbackYr + (b.lookbackYr - a.lookbackYr) * t,
  };
}

function redshiftToComovingDistance(z) {
  if (z <= 0) return 0;
  let lo = 0,
    hi = COSMO_TABLE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (COSMO_TABLE[mid].z < z) lo = mid;
    else hi = mid;
  }
  const a = COSMO_TABLE[lo],
    b = COSMO_TABLE[hi];
  const t = (z - a.z) / Math.max(1e-12, b.z - a.z);
  return a.distLy + (b.distLy - a.distLy) * t;
}

const CMB_REDSHIFT = 1089.0;
const CMB_DISTANCE_LY = redshiftToComovingDistance(CMB_REDSHIFT);

function distToRedshift(dLy) {
  return interpolateCosmologyByDistance(dLy).z;
}

function distToLookback(dLy) {
  return interpolateCosmologyByDistance(dLy).lookbackYr;
}
