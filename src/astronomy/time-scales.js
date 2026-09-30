// Offset is supplied explicitly: no guessed future leap seconds or implicit local timezone.
function utcToTimeScales(isoUtc, taiMinusUtcSeconds) {
  if (typeof isoUtc !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(isoUtc) ||
      !Number.isFinite(taiMinusUtcSeconds) || !Number.isInteger(taiMinusUtcSeconds) ||
      taiMinusUtcSeconds < 10 || taiMinusUtcSeconds > 100) throw new Error("Explicit UTC Z timestamp and TAI−UTC offset required.");
  const utc=isoToJulianDate(isoUtc);
  if (!Number.isFinite(utc)) throw new Error("Invalid UTC date; leap-second labels unsupported.");
  // Date.parse normalizes invalid dates; reject that normalization.
  if (new Date(Date.parse(isoUtc)).toISOString().slice(0,19)!==isoUtc.slice(0,19)) throw new Error("Invalid UTC calendar date.");
  const tt=utc+(taiMinusUtcSeconds+32.184)/86400;
  if (tt<2415020.5 || tt>2488069.5) throw new RangeError("Approximate TT→TDB outside 1900–2100.");
  const t=(tt-J2000_JD)/36525, g=(357.5277233+35999.05034*t)*Math.PI/180;
  const tdbMinusTtSeconds=0.001657*Math.sin(g)+0.000022*Math.sin(2*g);
  return {jdUtc:utc,jdTt:tt,jdTdb:tt+tdbMinusTtSeconds/86400,taiMinusUtcSeconds,tdbMinusTtSeconds,
    scientificMetadata:{category:"approximate",source:"caller-supplied TAI−UTC; two-term TT→TDB",
      epoch:utc,timeScale:"UTC",frame:null,units:{time:"Julian day",offset:"seconds"},
      method:"UTC→TT offset and two-term geocentric TT→TDB",assumptions:["Explicit leap-second offset; no leap-second instant"],
      uncertainty:null,validRange:[2415020.5,2488069.5]},
    category:"computed / approximate TDB",method:"TT = UTC + (TAI−UTC) + 32.184 s; two-term TT→TDB",
    limitations:["UTC JD does not represent leap-second instants.","TAI−UTC must be verified by caller.",
      "Approximate TT→TDB; not SOFA/ERFA execution; limited to 1900–2100."],validRangeJd:[2415020.5,2488069.5]};
}
