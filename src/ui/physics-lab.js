let physicsLabState = null;
let physicsLabRunning = false;
let physicsLabLastUpdate = 0;
let physicsLabInitialEnergy = null;
let physicsLabInitialDiagnostic=null,physicsLabInitialJd=null;

function renderPhysicsLab() {
  const output = document.getElementById("physics-lab-output");
  if (!output || !physicsLabState) return;
  const diagnostic = simulationDiagnostics(physicsLabState);
  const quality=simulationQuality(physicsLabState,physicsLabInitialDiagnostic,physicsLabInitialJd);
  const drift = physicsLabInitialEnergy ? (diagnostic.totalEnergy / physicsLabInitialEnergy - 1) : 0;
  output.textContent = `${astronomyTimeLabel(physicsLabState.timeJd, "model time")} · ${physicsLabState.bodies.length} bodies · E=${diagnostic.totalEnergy.toExponential(5)} · ΔE/E₀=${drift.toExponential(2)} · |P|=${diagnostic.momentumMagnitude.toExponential(2)} · steps=${quality.steps} · dt=${quality.stepDays} d · ΔL/L₀=${quality.angularMomentumRelativeDrift?.toExponential(2)??"undefined"} · ΔP=${quality.momentumAbsoluteDrift.toExponential(2)} · COM residual=${quality.centerOfMassResidualAu.toExponential(2)} AU (${PHYSICS_UNITS.distance}, ${PHYSICS_UNITS.time})`;
}

function loadPhysicsPreset() {
  const selector = document.getElementById("physics-preset");
  physicsLabState = simulationFromPreset(selector?.value || "sun-earth");
  physicsLabInitialDiagnostic=simulationDiagnostics(physicsLabState);physicsLabInitialJd=physicsLabState.timeJd;
  physicsLabInitialEnergy = physicsLabInitialDiagnostic.totalEnergy;
  renderPhysicsLab();
}

function physicsLabTick(now) {
  if (!physicsLabRunning || !physicsLabState || now - physicsLabLastUpdate < 60) return;
  physicsLabLastUpdate = now;
  const rate = Number(document.getElementById("physics-rate")?.value || 1);
  try { physicsLabState = advanceSimulation(physicsLabState, Math.min(40,Math.max(0.1, rate) * 2), 80); } catch(error) {physicsLabRunning=false;document.getElementById("physics-lab-output").textContent=error.message;return;}
  renderPhysicsLab();
}

document.getElementById("physics-load-btn")?.addEventListener("click", loadPhysicsPreset);
document.getElementById("physics-run-btn")?.addEventListener("click", () => { if (!physicsLabState) loadPhysicsPreset(); physicsLabRunning = !physicsLabRunning; document.getElementById("physics-run-btn").textContent = physicsLabRunning ? "Pause model" : "Run model"; });
document.getElementById("physics-step-btn")?.addEventListener("click", () => { if (!physicsLabState) loadPhysicsPreset(); physicsLabState = velocityVerletStep(physicsLabState); renderPhysicsLab(); });
loadPhysicsPreset();
