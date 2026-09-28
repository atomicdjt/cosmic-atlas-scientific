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
  let details = document.getElementById("provenance-detail");
  if (!details) { details=document.createElement("p"); details.id="provenance-detail"; document.getElementById("prov-distance").after(details); }
  const number = (v, unit) => Number.isFinite(v) ? `${v} ${unit}` : "not supplied";
  details.textContent = `Data class: ${tierLabel(item)}. Distance kind: ${item.angularOnly ? "angular only; arbitrary display shell" : item.dataClass === "reference" ? "defined reference" : item.dataClass === "model" ? "cosmology model" : item.distanceKind || "literature adopted"}. Formal distance σ: ${number(item.distanceSigmaLy,"ly")}. Parallax: ${number(item.parallaxMas,"mas")}; formal σπ: ${number(item.parallaxErrorMas,"mas")}. RUWE: ${number(item.ruwe,"")}. Source epoch: ${Number.isFinite(item.refEpoch) ? "J"+item.refEpoch : "not supplied"}; display epoch: ${Number.isFinite(item.displayEpoch) ? "J"+item.displayEpoch : "source epoch"}. Missing uncertainty is not zero uncertainty. Imported metadata are source claims, not certification.`;
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
