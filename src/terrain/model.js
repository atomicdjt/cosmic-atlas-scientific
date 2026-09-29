// Terrain metadata describes renderable body surfaces only. It never converts
// a sampled image into a measured elevation without declared datum/resolution.
function validateTerrainBody(body) {
  if (!body || typeof body.id !== "string" || !body.id || !isFiniteAstronomyNumber(body.equatorialRadiusKm) || body.equatorialRadiusKm <= 0) return null;
  const polar = isFiniteAstronomyNumber(body.polarRadiusKm) ? body.polarRadiusKm : body.equatorialRadiusKm;
  if (polar <= 0) return null;
  return { id: body.id, name: body.name || body.id, equatorialRadiusKm: body.equatorialRadiusKm, polarRadiusKm: polar, rotationPeriodHours: isFiniteAstronomyNumber(body.rotationPeriodHours) ? body.rotationPeriodHours : null, terrain: body.terrain || null, texture: body.texture || null, provenance: body.provenance || "unattributed", limitations: Array.isArray(body.limitations) ? body.limitations.slice() : [] };
}

function terrainEllipsoidPoint(body, latitudeDeg, longitudeDeg, heightKm) {
  const valid = validateTerrainBody(body);
  if (!valid || !isFiniteAstronomyNumber(latitudeDeg) || !isFiniteAstronomyNumber(longitudeDeg) || !isFiniteAstronomyNumber(heightKm || 0)) return null;
  const lat = latitudeDeg * Math.PI / 180, lon = longitudeDeg * Math.PI / 180;
  const a = valid.equatorialRadiusKm, b = valid.polarRadiusKm;
  const n = a * a / Math.sqrt(a * a * Math.cos(lat) ** 2 + b * b * Math.sin(lat) ** 2);
  const h = heightKm || 0;
  return [(n + h) * Math.cos(lat) * Math.cos(lon), (n * (b * b / (a * a)) + h) * Math.sin(lat), (n + h) * Math.cos(lat) * Math.sin(lon)];
}
