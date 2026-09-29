let physicsLabState = null;
let physicsLabRunning = false;
let physicsLabLastUpdate = 0;
let physicsLabInitialEnergy = null;

function renderPhysicsLab() {
  const output = document.getElementById("physics-lab-output");
  if (!output || !physicsLabState) return;
  const diagnostic = simulationDiagnostics(physicsLabState);
  const drift = physicsLabInitialEnergy ? (diagnostic.totalEnergy / physicsLabInitialEnergy - 1) : 0;
  output.textContent = `${astronomyTimeLabel(physicsLabState.timeJd, "model time")} · ${physicsLabState.bodies.length} bodies · E=${diagnostic.totalEnergy.toExponential(5)} · ΔE/E₀=${drift.toExponential(2)} · |P|=${diagnostic.momentumMagnitude.toExponential(2)} (${PHYSICS_UNITS.distance}, ${PHYSICS_UNITS.time})`;
}

function loadPhysicsPreset() {
  const selector = document.getElementById("physics-preset");
  physicsLabState = simulationFromPreset(selector?.value || "sun-earth");
  physicsLabInitialEnergy = simulationDiagnostics(physicsLabState).totalEnergy;
  renderPhysicsLab();
}

function physicsLabTick(now) {
  if (!physicsLabRunning || !physicsLabState || now - physicsLabLastUpdate < 60) return;
  physicsLabLastUpdate = now;
  const rate = Number(document.getElementById("physics-rate")?.value || 1);
  physicsLabState = advanceSimulation(physicsLabState, Math.max(0.1, rate) * 2, 80);
  renderPhysicsLab();
}

document.getElementById("physics-load-btn")?.addEventListener("click", loadPhysicsPreset);
document.getElementById("physics-run-btn")?.addEventListener("click", () => { if (!physicsLabState) loadPhysicsPreset(); physicsLabRunning = !physicsLabRunning; document.getElementById("physics-run-btn").textContent = physicsLabRunning ? "Pause model" : "Run model"; });
document.getElementById("physics-step-btn")?.addEventListener("click", () => { if (!physicsLabState) loadPhysicsPreset(); physicsLabState = velocityVerletStep(physicsLabState); renderPhysicsLab(); });
loadPhysicsPreset();
