function distToSceneRadius(d) {
  if (d <= 0) return 0;
  if (d <= 100) {
    return 40.0 * Math.pow(d / 100.0, 0.6);
  } else if (d <= 100000) {
    return 40.0 + (120.0 * (Math.log10(d) - 2.0)) / 3.0;
  } else if (d <= 5000000) {
    return (
      160.0 + (160.0 * (Math.log10(d) - 5.0)) / (Math.log10(5000000) - 5.0)
    );
  } else if (d <= 250000000) {
    return (
      320.0 +
      (280.0 * (Math.log10(d) - Math.log10(5000000))) /
        (Math.log10(250000000) - Math.log10(5000000))
    );
  } else if (d <= 5000000000) {
    return (
      600.0 +
      (400.0 * (Math.log10(d) - Math.log10(250000000))) /
        (Math.log10(5000000000) - Math.log10(250000000))
    );
  } else {
    const dClamped = Math.min(d, MODEL_MAX_LY);
    return (
      1000.0 +
      (600.0 * (Math.log10(dClamped) - Math.log10(5000000000))) /
        (Math.log10(MODEL_MAX_LY) - Math.log10(5000000000))
    );
  }
}

function sceneRadiusToDist(r) {
  if (r <= 0) return 0;
  if (r <= 40) {
    return 100.0 * Math.pow(r / 40.0, 1.0 / 0.6);
  } else if (r <= 160) {
    return Math.pow(10.0, 2.0 + (3.0 * (r - 40.0)) / 120.0);
  } else if (r <= 320) {
    return Math.pow(
      10.0,
      5.0 + ((Math.log10(5000000) - 5.0) * (r - 160.0)) / 160.0,
    );
  } else if (r <= 600) {
    return Math.pow(
      10.0,
      Math.log10(5000000) +
        ((Math.log10(250000000) - Math.log10(5000000)) * (r - 320.0)) / 280.0,
    );
  } else if (r <= 1000) {
    return Math.pow(
      10.0,
      Math.log10(250000000) +
        ((Math.log10(5000000000) - Math.log10(250000000)) * (r - 600.0)) /
          400.0,
    );
  } else {
    return Math.pow(
      10.0,
      Math.log10(5000000000) +
        ((Math.log10(MODEL_MAX_LY) - Math.log10(5000000000)) *
          (Math.min(r, 1600) - 1000.0)) /
          600.0,
    );
  }
}

function astronomicalToCartesian(raDeg, decDeg, distLy) {
  const raRad = (raDeg * Math.PI) / 180.0;
  const decRad = (decDeg * Math.PI) / 180.0;
  const r = distToSceneRadius(distLy);
  return [
    r * Math.cos(decRad) * Math.cos(raRad),
    r * Math.sin(decRad),
    r * Math.cos(decRad) * Math.sin(raRad),
  ];
}
