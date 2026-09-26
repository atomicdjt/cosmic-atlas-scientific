// Units: mas, Julian years, parsecs and light-years. Missing values never coerce to zero.
const LY_PER_PC = 3.261563777;
function finiteNumber(value) {
  return value == null || value === "" || typeof value === "boolean"
    ? NaN
    : Number(value);
}
