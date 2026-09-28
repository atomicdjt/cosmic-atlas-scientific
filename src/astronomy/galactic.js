// ICRS (J2000-equivalent) to Galactic coordinates using the standard
// rotation matrix adopted for modern equatorial/galactic transformations.
function icrsToGalactic(raDeg, decDeg) {
  const ra = (raDeg * Math.PI) / 180.0,
    dec = (decDeg * Math.PI) / 180.0;
  const x = Math.cos(dec) * Math.cos(ra),
    y = Math.cos(dec) * Math.sin(ra),
    z = Math.sin(dec);
  const gx = -0.0548755604 * x - 0.8734370902 * y - 0.4838350155 * z;
  const gy = 0.4941094279 * x - 0.44482963 * y + 0.7469822445 * z;
  const gz = -0.867666149 * x - 0.1980763734 * y + 0.4559837762 * z;
  let l = (Math.atan2(gy, gx) * 180) / Math.PI;
  if (l < 0) l += 360;
  const b = (Math.asin(Math.max(-1, Math.min(1, gz))) * 180) / Math.PI;
  return { l, b };
}
