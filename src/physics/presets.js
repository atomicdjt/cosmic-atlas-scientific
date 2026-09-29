const PHYSICS_PRESETS = Object.freeze({
  "sun-earth": {
    label: "Sun–Earth circular reference",
    description: "Two-body reference in AU, solar masses and Julian days. Initial conditions are pedagogical, not a JPL ephemeris.",
    bodies: [
      { id: "sun", name: "Sun", massSolar: 1, positionAu: [0, 0, 0], velocityAuDay: [0, 0, 0], radiusAu: 0.00465, color: "#ffd166", provenance: "defined reference model" },
      { id: "earth", name: "Earth", massSolar: 3.003e-6, positionAu: [1, 0, 0], velocityAuDay: [0, Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2), 0], radiusAu: 0.000043, color: "#69b7ff", provenance: "defined reference model" },
    ],
  },
  "binary-star": {
    label: "Equal-mass binary",
    description: "Conservative two-body example centered on the barycenter; no tides, relativity or stellar evolution.",
    bodies: [
      { id: "a", name: "Star A", massSolar: 1, positionAu: [-0.5, 0, 0], velocityAuDay: [0, -Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 / 2), 0], radiusAu: 0.00465, color: "#fff0c2", provenance: "defined reference model" },
      { id: "b", name: "Star B", massSolar: 1, positionAu: [0.5, 0, 0], velocityAuDay: [0, Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 / 2), 0], radiusAu: 0.00465, color: "#ffb4b4", provenance: "defined reference model" },
    ],
  },
});

function simulationFromPreset(id, options) {
  const preset = PHYSICS_PRESETS[id];
  if (!preset) throw new Error("Unknown physics preset: " + id);
  return createSimulationState(preset.bodies, { ...(options || {}), stepDays: options?.stepDays || 0.5 });
}
