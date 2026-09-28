function absoluteG(item) {
  const q = parallaxDistance(item.raw || {});
  return q && Number.isFinite(item.photG)
    ? item.photG + 5 * Math.log10(item.parallaxMas) - 10
    : null;
}
