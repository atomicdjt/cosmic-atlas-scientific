function formatDistance(dLy) {
  if (dLy < 0.01) return "0.00 ly (Sol Local)";
  if (dLy < 1000) return dLy.toFixed(2) + " ly";
  if (dLy < 1000000) return (dLy / 1000).toFixed(2) + " kly";
  if (dLy < 1000000000) return (dLy / 1000000).toFixed(2) + " Mly";
  return (dLy / 1000000000).toFixed(2) + " Gly";
}

function formatLookback(years) {
  if (years < 1000) return years.toFixed(0) + " Years ago";
  if (years < 1000000) return (years / 1000).toFixed(1) + " Thousand Years ago";
  if (years < 1000000000)
    return (years / 1000000).toFixed(2) + " Million Years ago";
  return (years / 1000000000).toFixed(2) + " Billion Years ago";
}

function getRealmName(dLy) {
  if (dLy < 15) return "Solar Neighborhood (Oort Cloud)";
  if (dLy < 300) return "Local Interstellar Bubble";
  if (dLy < 10000) return "Orion-Cygnus Galactic Arm";
  if (dLy < 120000) return "Milky Way Galaxy";
  if (dLy < 6000000) return "Local Galactic Group";
  if (dLy < 110000000) return "Virgo Supercluster";
  if (dLy < 520000000) return "Laniakea Supercluster";
  if (dLy < 3000000000) return "Large-Scale Filamentary Web";
  if (dLy < 30000000000) return "Deep Universe & Early Quasars";
  return "Cosmic Microwave Background (Horizon)";
}

function hexToRgb(hex) {
  const c = parseInt(hex.replace("#", ""), 16);
  return [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
}
