function physicalMeasurementAllowed(item) {
  return (
    !item.angularOnly &&
    !item.imported &&
    item.measurementEligible !== false &&
    !["context", "model", "procedural"].includes(item.dataClass) &&
    Number.isFinite(item.physicalDistanceLy ?? item.distLy)
  );
}
