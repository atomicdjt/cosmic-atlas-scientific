function renderMissionEstimate() {
  const origin = Number(document.getElementById("mission-origin-au")?.value);
  const destination = Number(document.getElementById("mission-destination-au")?.value);
  const output = document.getElementById("mission-output");
  const estimate = hohmannTransferEstimate(origin, destination);
  if (!output) return;
  output.textContent = estimate ? `${estimate.method}: ${estimate.timeDays.toFixed(1)} d; total idealized Δv ${estimate.deltaVAuDay.toExponential(4)} AU/day. Assumptions: ${estimate.assumptions.join("; ")}.` : "Enter two positive heliocentric radii in AU.";
}
document.getElementById("mission-estimate-btn")?.addEventListener("click", renderMissionEstimate);
renderMissionEstimate();
