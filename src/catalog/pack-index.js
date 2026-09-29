// Catalog packs are build-time manifests. The standalone keeps its embedded
// 5k Gaia tier; it never silently fetches a network catalog at runtime.
function validateCatalogPack(pack) {
  if (!pack || typeof pack.id !== "string" || !pack.id || typeof pack.label !== "string") return null;
  if (!Number.isInteger(pack.recordCount) || pack.recordCount < 0 || typeof pack.provenance !== "string") return null;
  return { id: pack.id, label: pack.label, recordCount: pack.recordCount, coordinateFrame: pack.coordinateFrame || "ICRS", spatialIndex: pack.spatialIndex || null, provenance: pack.provenance, delivery: pack.delivery || "local import", limitations: Array.isArray(pack.limitations) ? pack.limitations.slice() : [] };
}

function catalogPacksForCapability(packs, capability) {
  return (packs || []).map(validateCatalogPack).filter(Boolean).filter((pack) => !capability || pack.delivery === capability);
}

function catalogPackSummary(pack) {
  const valid = validateCatalogPack(pack);
  return valid ? `${valid.label}: ${valid.recordCount.toLocaleString()} records; ${valid.delivery}; ${valid.coordinateFrame}.` : "Invalid catalog pack metadata.";
}
