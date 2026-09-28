const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  path = require("node:path");
const root = path.resolve(__dirname, "..");
const names = [
  "cosmology/model.js",
  "astronomy/distance-scale.js",
  "astronomy/random.js",
  "astronomy/coordinates.js",
  "astronomy/galactic.js",
  "ui/format.js",
  "astronomy/units.js",
  "astronomy/uncertainty.js",
  "astronomy/distance-semantics.js",
  "catalog/provenance.js",
  "astronomy/measurement-uncertainty.js",
  "astronomy/epoch.js",
  "astronomy/galactic-inverse.js",
  "astronomy/photometry.js",
  "catalog/normalize.js",
  "astronomy/measurement.js",
  "catalog/filtering.js",
  "interaction/spatial-index.js",
];
const ctx = vm.createContext({ console, structuredClone });
vm.runInContext(
  names
    .map((n) => fs.readFileSync(path.join(root, "src", n), "utf8"))
    .join("\n"),
  ctx,
);
let count = 0;
function test(name, code) {
  vm.runInContext("{" + code + "}", ctx);
  count++;
  console.log("PASS " + name);
}
ctx.assert = assert;
test(
  "Independent Wolfram comoving fixtures",
  `for(const [z,d] of [[.158339,2209025954.7769227],[1,11092369597.366245],[1089,45218866181.355774]]) assert.ok(Math.abs(redshiftToComovingDistance(z)/d-1)<3e-5)`,
);
test(
  "Independent Wolfram lookback fixtures",
  `for(const [z,t] of [[.158339,2052673596.8267415],[1,7949945524.668449],[1089,13790320753.096798]]) assert.ok(Math.abs(distToLookback(redshiftToComovingDistance(z))/t-1)<5e-5)`,
);
test(
  "Galactic center transform",
  `const g=icrsToGalactic(266.4051,-28.936175);assert.ok(Math.min(g.l,360-g.l)<.001);assert.ok(Math.abs(g.b)<.001)`,
);
test(
  "Coordinate direction axes",
  `assert.ok(Math.abs(unitFromRaDec(90,0)[2]-1)<1e-12)`,
);
test(
  "Distance display round trips",
  `for(const d of [1,100,1000,100000,5e6,1e9,1e10]) assert.ok(Math.abs(sceneRadiusToDist(distToSceneRadius(d))/d-1)<1e-10)`,
);
test(
  "Angular separation",
  `assert.ok(Math.abs(angularSeparationDeg({ra:0,dec:0},{ra:90,dec:0})-90)<1e-12)`,
);
test(
  "Physical separation independent geometry",
  `assert.equal(spatialSeparationLy({ra:0,dec:0,distLy:3},{ra:90,dec:0,distLy:4}),5)`,
);
test(
  "Angular-only safeguard",
  `assert.equal(spatialSeparationLy({ra:0,dec:0,distLy:1000,angularOnly:true},{ra:90,dec:0,distLy:4}),null)`,
);
test(
  "Seed determinism",
  `const r1=mulberry32(42),r2=mulberry32(42);for(let i=0;i<100;i++)assert.equal(r1(),r2())`,
);
test(
  "Valid catalog normalization",
  `assert.equal(normalizeImportedRecord({id:'x',ra_deg:360,dec_deg:5,distance_ly:10},0).ra,0)`,
);
test(
  "Null coordinates rejected",
  `assert.equal(normalizeImportedRecord({id:'x',ra_deg:null,dec_deg:null},0),null)`,
);
test(
  "Explicit angular flag overrides distance",
  `assert.equal(normalizeImportedRecord({id:'x',ra_deg:1,dec_deg:2,distance_ly:40,angular_only:true},0).physicalDistanceLy,null)`,
);
test(
  "Low SNR never creates distance",
  `assert.equal(normalizeImportedRecord({id:'x',ra_deg:1,dec_deg:2,parallax_mas:1,parallax_error_mas:.5},0).angularOnly,true)`,
);
test(
  "Missing uncertainty never creates distance",
  `assert.equal(normalizeImportedRecord({id:'x',ra_deg:1,dec_deg:2,parallax_mas:1},0).angularOnly,true)`,
);
test(
  "High SNR inverse parallax",
  `assert.ok(Math.abs(normalizeImportedRecord({id:'x',ra_deg:1,dec_deg:2,parallax_mas:1000,parallax_error_mas:1},0).physicalDistanceLy-3.261563777)<1e-10)`,
);
test(
  "High RUWE prevents inference",
  `assert.equal(parallaxDistance({parallax_mas:10,parallax_error_mas:.1,ruwe:2}),null)`,
);
test(
  "Unknown fields preserved",
  `const x=normalizeImportedRecord({id:'x',ra_deg:1,dec_deg:2,custom_covariance:[1,2]},0);assert.equal(JSON.stringify(x.raw.custom_covariance),'[1,2]')`,
);
test(
  "Galactic inverse round trips",
  `for(const [a,d] of [[0,0],[100,-50],[359,80]]){const g=icrsToGalactic(a,d),back=galacticToIcrs(g.l,g.b);assert.ok(Math.abs(((back.ra-a+540)%360)-180)<1e-7);assert.ok(Math.abs(back.dec-d)<1e-7)}`,
);
test(
  "Proper motion tangent convention",
  `const p=propagateEpoch({ra_deg:0,dec_deg:0,ref_epoch:2016,pmra_masyr:1000,pmdec_masyr:0},2026);assert.ok(Math.abs(p.ra_deg-10/3600)<1e-9)`,
);
test(
  "Epoch guard",
  `assert.equal(propagateEpoch({ra_deg:0,dec_deg:0,ref_epoch:2016,pmra_masyr:1,pmdec_masyr:1},2300),null)`,
);
test(
  "Pole propagation finite",
  `const p=propagateEpoch({ra_deg:0,dec_deg:90,ref_epoch:2016,pmra_masyr:100,pmdec_masyr:100},2026);assert.ok(Number.isFinite(p.ra_deg)&&Number.isFinite(p.dec_deg))`,
);
test(
  "Micro-angle precision",
  `assert.ok(Math.abs(angularSeparationDeg({ra:0,dec:0},{ra:1e-7,dec:0})-1e-7)<1e-14)`,
);
test(
  "Context cannot claim physical separation",
  `assert.equal(spatialSeparationLy({ra:0,dec:0,distLy:1,dataClass:'context'},{ra:0,dec:0,distLy:2}),null)`,
);
test(
  "Mixed distance bases refused",
  `assert.equal(spatialSeparationLy({ra:0,dec:0,distLy:1,distanceKind:'comoving'},{ra:0,dec:0,distLy:2}),null)`,
);
test(
  "Absolute magnitude",
  `assert.equal(absoluteG({raw:{parallax_mas:100,parallax_error_mas:1},parallaxMas:100,photG:5}),5)`,
);
test(
  "Unsafe source links refused",
  `assert.equal(safeSourceUrl('javascript:alert(1)'),false)`,
);
ctx.fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/independent-numerics.json'),'utf8'));
test('Independent Sirius Galactic fixture',`const g=icrsToGalactic(101.2870833,-16.7161111);assert.ok(Math.abs(g.l-fixture.sirius_galactic.l)<1e-8);assert.ok(Math.abs(g.b-fixture.sirius_galactic.b)<1e-8)`);
test('Independent Sirius Vega separation',`assert.ok(Math.abs(angularSeparationDeg({ra:101.2870833,dec:-16.7161111},{ra:279.2347348,dec:38.7836889})-fixture.sirius_vega_angular_degrees)<1e-8)`);
test('Large IDs require strings',`assert.equal(normalizeImportedRecord({id:9007199254740992,ra_deg:1,dec_deg:2},0),null)`);
test('Unverified tier and angular-only provenance round trip',`const a=normalizeImportedRecord({id:'a',ra_deg:1,dec_deg:2,angular_only:true,display_shell_ly:1000,custom:{a:1},tier:'context'},0),b=normalizeImportedRecord(exportRecord(a),0);assert.equal(a.dataClass,'external');assert.equal(b.dataClass,'external');assert.equal(b.angularOnly,true);assert.equal(b.raw.custom.a,1);assert.equal(exportRecord(b).source_claims.tier,'context');assert.equal(exportRecord(b).distance_ly,null)`);
test('Numeric filters exclude unknowns',`const a=normalizeImportedRecord({id:'a',ra_deg:1,dec_deg:2,angular_only:true},0);assert.equal(matchesCatalogFilter(a,{...catalogFilter,snrMin:10}),false);assert.equal(matchesCatalogFilter(a),true)`);
test('Screen grid nearest and misses',`const g=new ScreenGrid();const a={id:'a',pos:[10,10]},b={id:'b',pos:[200,100]};g.build([a,b],x=>x);assert.equal(g.nearest(11,11).id,'a');assert.equal(g.nearest(500,500),null)`);
console.log(JSON.stringify({ passed: count }));
