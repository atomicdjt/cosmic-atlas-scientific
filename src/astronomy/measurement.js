function angularSeparationDeg(a, b) {
  const r1 = (a.ra * Math.PI) / 180,
    r2 = (b.ra * Math.PI) / 180;
  const d1 = (a.dec * Math.PI) / 180,
    d2 = (b.dec * Math.PI) / 180;
  const cosSep =
    Math.sin(d1) * Math.sin(d2) +
    Math.cos(d1) * Math.cos(d2) * Math.cos(r1 - r2);
  const aVec = unitFromRaDec(a.ra, a.dec),
    bVec = unitFromRaDec(b.ra, b.dec);
  return (
    (Math.atan2(
      Math.hypot(...crossVec3(aVec, bVec)),
      Math.max(-1, Math.min(1, cosSep)),
    ) *
      180) /
    Math.PI
  );
}

function spatialSeparationLy(a, b) {
  const theta = (angularSeparationDeg(a, b) * Math.PI) / 180;
  if (!physicalMeasurementAllowed(a) || !physicalMeasurementAllowed(b))
    return null;
  const da = a.physicalDistanceLy ?? a.distLy,
    db = b.physicalDistanceLy ?? b.distLy;
  if (
    (a.distanceKind === "comoving" || a.id === "quasar_3c273") !==
    (b.distanceKind === "comoving" || b.id === "quasar_3c273")
  )
    return null;
  return Math.hypot(da - db, 2 * Math.sqrt(da * db) * Math.sin(theta / 2));
}
