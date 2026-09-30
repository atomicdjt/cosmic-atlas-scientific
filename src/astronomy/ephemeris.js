// Geometric state vectors use conventional ICRF [X,Y,Z], unlike display [X,Z,Y].
const AU_KM = 149597870.7;
let embeddedEphemerisCache = null;
function embeddedEphemeris() {
  if (!embeddedEphemerisCache) {
    const node = document.getElementById("embedded-ephemeris");
    embeddedEphemerisCache = validateEphemerisAsset(JSON.parse(node.textContent));
  }
  return embeddedEphemerisCache;
}
function validateEphemerisAsset(asset) {
  if (!asset || asset.schema !== "cosmic-atlas.ephemeris.v1" || asset.frame !== "ICRF" ||
      asset.timeScale !== "TDB" || asset.origin !== "solar-system barycenter" ||
      asset.units?.position !== "AU" || asset.units?.velocity !== "AU/day" ||
      asset.extrapolation !== "refuse" || !Number.isFinite(asset.cadenceDays) || asset.cadenceDays <= 0 ||
      !Array.isArray(asset.validRangeJd) || asset.validRangeJd.length !== 2 ||
      !asset.validRangeJd.every(Number.isFinite) || asset.validRangeJd[1] <= asset.validRangeJd[0] ||
      !asset.bodies || !asset.bodies["10"]) throw new Error("Unsupported ephemeris contract.");
  const count = Math.round((asset.validRangeJd[1]-asset.validRangeJd[0])/asset.cadenceDays)+1;
  if (count > 100000) throw new Error("Ephemeris safety limit exceeded.");
  for (const body of Object.values(asset.bodies)) {
    if (typeof body.name !== "string" || typeof body.sourceVersion !== "string" ||
        !Array.isArray(body.samples) || body.samples.length !== count) throw new Error("Incomplete ephemeris.");
    body.samples.forEach((row,i) => {
      if (!Array.isArray(row) || row.length !== 7 || !row.every(Number.isFinite) ||
          Math.abs(row[0]-asset.validRangeJd[0]-i*asset.cadenceDays)>1e-9) throw new Error("Invalid ephemeris grid.");
    });
  }
  return asset;
}
function interpolateEphemeris(asset, target, jdTdb) {
  const body = asset.bodies[String(target)];
  if (!body || !Number.isFinite(jdTdb) || jdTdb < asset.validRangeJd[0] || jdTdb > asset.validRangeJd[1])
    throw new RangeError("Ephemeris target/epoch unsupported; extrapolation refused.");
  const index = Math.min(body.samples.length-2, Math.floor((jdTdb-asset.validRangeJd[0])/asset.cadenceDays));
  const a = body.samples[index], b = body.samples[index+1], h = b[0]-a[0], u = (jdTdb-a[0])/h;
  const positionAu=[], velocityAuDay=[];
  for (let k=1;k<=3;k++) {
    positionAu.push((2*u**3-3*u*u+1)*a[k]+(u**3-2*u*u+u)*h*a[k+3]+(-2*u**3+3*u*u)*b[k]+(u**3-u*u)*h*b[k+3]);
    velocityAuDay.push(((6*u*u-6*u)*a[k]+(3*u*u-4*u+1)*h*a[k+3]+(-6*u*u+6*u)*b[k]+(3*u*u-2*u)*h*b[k+3])/h);
  }
  return { target:String(target), name:body.name, epochJd:jdTdb, timeScale:"TDB", frame:"ICRF",
    origin:"solar-system barycenter", units:{position:"AU",velocity:"AU/day"}, positionAu, velocityAuDay,
    provenance:{category:u===0 || u===1 ? "source-derived sampled state" : "interpolated source-derived state",
      assetSha256:asset.assetSha256??null, source:asset.source, sourceVersion:body.sourceVersion, sourceUrl:asset.sourceUrl,
      method:asset.interpolation, validRangeJd:asset.validRangeJd.slice(), uncertainty:null,
      validation:asset.validation[String(target)]} };
}
function ephemerisState(asset, target, jdTdb, center = "0") {
  const result=interpolateEphemeris(asset,target,jdTdb);
  if (String(center)!=="0") {
    const origin=interpolateEphemeris(asset,center,jdTdb);
    result.positionAu=subtractVec3(result.positionAu,origin.positionAu);
    result.velocityAuDay=subtractVec3(result.velocityAuDay,origin.velocityAuDay);
    result.origin=origin.name;
    result.provenance.relativeTo=origin.provenance;
  }
  result.center=String(center);
  result.scientificMetadata={category:result.provenance.category.includes("sampled")?"source-derived":"interpolated source-derived",
    source:result.provenance,epoch:jdTdb,timeScale:"TDB",frame:"ICRF; origin "+result.origin,units:result.units,
    method:asset.interpolation,assumptions:["Geometric simultaneous states; no light-time or aberration correction"],
    uncertainty:null,validRange:asset.validRangeJd.slice()};
  return result;
}
function geometricDirectionFromState(state) {
  const r=Math.hypot(...state.positionAu);
  if (!(r>0)) throw new Error("Coincident origin has no direction.");
  return {raDeg:(Math.atan2(state.positionAu[1],state.positionAu[0])*180/Math.PI+360)%360,
    decDeg:Math.asin(state.positionAu[2]/r)*180/Math.PI, distanceAu:r,
    frame:state.frame, epochJd:state.epochJd, timeScale:state.timeScale,
    category:"computed geometric direction", method:"simultaneous geometric relative state",
    limitations:["No light-time, aberration, observer parallax or apparent-place correction."], provenance:state.provenance};
}
