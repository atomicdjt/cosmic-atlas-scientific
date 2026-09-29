// Explicit astronomical time contract. Values are Julian Date (UTC-like input)
// or Julian years, never browser-local time inferred from Date without a label.
const JULIAN_DAY_SECONDS = 86400;
const JULIAN_YEAR_DAYS = 365.25;
const J2000_JD = 2451545.0;

function isFiniteAstronomyNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function julianYearToJd(year) {
  return isFiniteAstronomyNumber(year)
    ? J2000_JD + (year - 2000.0) * JULIAN_YEAR_DAYS
    : NaN;
}

function jdToJulianYear(jd) {
  return isFiniteAstronomyNumber(jd)
    ? 2000.0 + (jd - J2000_JD) / JULIAN_YEAR_DAYS
    : NaN;
}

function isoToJulianDate(iso) {
  const milliseconds = Date.parse(iso);
  return Number.isFinite(milliseconds) ? 2440587.5 + milliseconds / 86400000 : NaN;
}

function astronomyTimeLabel(jd, scale) {
  if (!isFiniteAstronomyNumber(jd)) return "Invalid time";
  return `JD ${jd.toFixed(5)} ${scale || "UTC"}`;
}
