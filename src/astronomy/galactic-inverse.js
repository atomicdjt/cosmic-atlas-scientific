function galacticToIcrs(l, b) {
  const a = (l * Math.PI) / 180,
    d = (b * Math.PI) / 180,
    x = Math.cos(d) * Math.cos(a),
    y = Math.cos(d) * Math.sin(a),
    z = Math.sin(d);
  const ex = -0.0548755604 * x + 0.4941094279 * y - 0.867666149 * z,
    ey = -0.8734370902 * x - 0.44482963 * y - 0.1980763734 * z,
    ez = -0.4838350155 * x + 0.7469822445 * y + 0.4559837762 * z;
  return {
    ra: ((Math.atan2(ey, ex) * 180) / Math.PI + 360) % 360,
    dec: (Math.asin(Math.max(-1, Math.min(1, ez))) * 180) / Math.PI,
  };
}
