// Zero-revolution, geometric two-body universal-variable Lambert.
// Bracketing/bisection reports time residual; singular geometry is refused.
function stumpff(z) {
  if (Math.abs(z)<1e-6) return {c:0.5-z/24+z*z/720-z**3/40320,s:1/6-z/120+z*z/5040-z**3/362880};
  if (z>0) {const q=Math.sqrt(z);return {c:2*Math.sin(q/2)**2/z,s:(q-Math.sin(q))/(q**3)};}
  const q=Math.sqrt(-z);return {c:(Math.cosh(q)-1)/(-z),s:(Math.sinh(q)-q)/(q**3)};
}
function solveLambert(r1, r2, time, mu, options = {}) {
  if (![r1,r2].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)) ||
      !Number.isFinite(time) || time<=0 || !Number.isFinite(mu) || mu<=0 ||
      (options.longWay!==undefined && typeof options.longWay!=="boolean")) throw new Error("Invalid Lambert inputs.");
  const a=Math.hypot(...r1),b=Math.hypot(...r2);
  if (!(a>0&&b>0)) throw new Error("Lambert endpoint is at the central singularity.");
  const cos=Math.max(-1,Math.min(1,dotVec3(r1,r2)/(a*b)));
  const sin=Math.hypot(...crossVec3(r1,r2))/(a*b)*(options.longWay?-1:1);
  if (Math.abs(sin)<1e-8) throw new Error("Collinear Lambert geometry unsupported.");
  const A=sin*Math.sqrt(a*b/(1-cos));
  const evaluate=z=>{
    const {c,s}=stumpff(z); if (!(c>0)) return null;
    const y=a+b+A*(z*s-1)/Math.sqrt(c); if (!(y>0)) return null;
    const t=((y/c)**1.5*s+A*Math.sqrt(y))/Math.sqrt(mu);
    return Number.isFinite(t)&&t>=0 ? {t,y} : null;
  };
  // Below the minimum valid y, time approaches zero. This bounds hyperbolic roots.
  let low=-4*Math.PI*Math.PI,high=4*Math.PI*Math.PI-1e-3;
  const upper=evaluate(high); if (!upper || upper.t<time) throw new Error("Transfer outside solver bracket.");
  const lower=evaluate(low); if (lower && lower.t>time) throw new Error("Transfer too short for bounded solver.");
  const tolerance=Math.max(time*1e-11,1e-12);
  let solution=null,z=0,iterations=0;
  for (;iterations<120;iterations++) {
    z=(low+high)/2; const value=evaluate(z);
    if (!value) {low=z;continue;}
    solution=value;
    if (Math.abs(value.t-time)<=tolerance) break;
    if (value.t<time) low=z; else high=z;
  }
  if (!solution || Math.abs(solution.t-time)>tolerance) throw new Error("Lambert failed to converge.");
  const f=1-solution.y/a,g=A*Math.sqrt(solution.y/mu),gdot=1-solution.y/b;
  if (Math.abs(g)<1e-14) throw new Error("Singular Lambert coefficient.");
  const departureVelocity=r1.map((v,i)=>(r2[i]-f*v)/g);
  const arrivalVelocity=r2.map((v,i)=>(gdot*v-r1[i])/g);
  if (!departureVelocity.concat(arrivalVelocity).every(Number.isFinite)) throw new Error("Nonfinite Lambert state.");
  return {departureVelocity,arrivalVelocity,iterations:iterations+1,timeResidual:solution.t-time,
    tolerance,method:"universal-variable bracketed bisection",revolutions:0,longWay:!!options.longWay,
    category:"numerically computed two-body transfer",limitations:["No multi-revolution or collinear solution.",
      "No thrust, planetary perturbations, navigation, launch vehicle or encounter certification."]};
}
function missionFromEphemeris(asset, departure, arrival, departureJd, arrivalJd, options = {}) {
  if (departure===arrival || arrivalJd<=departureJd) throw new Error("Distinct bodies and positive flight time required.");
  const start=ephemerisState(asset,departure,departureJd,"10"), end=ephemerisState(asset,arrival,arrivalJd,"10");
  const transfer=solveLambert(start.positionAu,end.positionAu,arrivalJd-departureJd,
    GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2,options);
  const factor=AU_KM/86400;
  const vinfDeparture=subtractVec3(transfer.departureVelocity,start.velocityAuDay).map(x=>x*factor);
  const vinfArrival=subtractVec3(transfer.arrivalVelocity,end.velocityAuDay).map(x=>x*factor);
  return {schema:"cosmic-atlas.lambert-mission.v1",departure:start,arrival:end,durationDays:arrivalJd-departureJd,
    transfer,departureVInfinityKmS:Math.hypot(...vinfDeparture),arrivalVInfinityKmS:Math.hypot(...vinfArrival),
    c3Km2S2:dotVec3(vinfDeparture,vinfDeparture),units:{time:"day",velocity:"km/s",c3:"km²/s²"},
    scientificMetadata:{category:"numerically computed",source:{departure:start.provenance,arrival:end.provenance},
      epoch:departureJd,timeScale:"TDB",frame:"heliocentric ICRF",units:{velocity:"km/s",c3:"km²/s²",time:"day"},
      method:transfer.method,assumptions:transfer.limitations,uncertainty:null,validRange:asset.validRangeJd.slice()},
    category:"patched-conic estimate from source-derived endpoint states",frame:"heliocentric ICRF",timeScale:"TDB",
    assumptions:["Sun-only two-body coast; impulsive endpoints", "C3 is departure v∞², not launch performance",
      "Arrival v∞ is not capture delta-v", "Planet system barycenters are named explicitly"]};
}
