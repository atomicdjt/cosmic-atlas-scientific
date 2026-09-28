function formatObservedMotion(item) {
  if (item.zObs == null && item.rv == null) return "—";
  if (item.zObs != null && item.rv != null) {
    const z =
      Math.abs(item.zObs) >= 0.01 ? item.zObs.toFixed(6) : item.zObs.toFixed(6);
    return `z=${z} / ${item.rv.toFixed(2)} km/s`;
  }
  if (item.zObs != null) return `z=${item.zObs}`;
  return `${item.rv.toFixed(2)} km/s`;
}

function tierLabel(item) {
  if (item.dataClass === "observational")
    return "Observational / literature grounded";
  if (item.dataClass === "reference") return "Reference origin";
  if (item.dataClass === "external")
    return "Imported / unverified; measurement-ineligible";
  if (item.dataClass === "model") return "Cosmology model";
  return "Illustrative context";
}

function updateProvenance(item) {
  const tier = document.getElementById("data-tier");
  tier.className = `data-tier ${item.dataClass}`;
  tier.innerText = tierLabel(item);
  document.getElementById("prov-source").innerText =
    item.source || "No source metadata";
  document.getElementById("prov-record").innerText =
    `${item.record || ""}${item.sourceRef ? ` • ${item.sourceRef}` : ""}`;
  document.getElementById("prov-distance").innerText =
    `Distance basis: ${item.distanceBasis || "Not specified"}`;
  const links = [];
  if (safeSourceUrl(item.sourceUrl))
    links.push(
      `<a class="source-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(item.sourceUrl)}">Object / catalog source</a>`,
    );
  if (safeSourceUrl(item.distanceUrl))
    links.push(
      `<a class="source-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(item.distanceUrl)}">Distance / model source</a>`,
    );
  document.getElementById("prov-links").innerHTML = links.join("");
}
