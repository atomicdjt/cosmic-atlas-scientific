// Small-system N-body state in AU, solar masses and Julian days. This unit
// system keeps values well-conditioned and makes the gravitational constant
// explicit. The lab is not a solar-system ephemeris.
const PHYSICS_UNITS = Object.freeze({ distance: "AU", mass: "solar mass", time: "Julian day", velocity: "AU/day" });
const GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 = 2.959122082855911e-4;

function createBody(input) {
  if (!input || typeof input.id !== "string" || !input.id || !isFiniteAstronomyNumber(input.massSolar) || input.massSolar <= 0) return null;
  const position = input.positionAu, velocity = input.velocityAuDay;
  if (!Array.isArray(position) || !Array.isArray(velocity) || position.length !== 3 || velocity.length !== 3 || !position.concat(velocity).every(isFiniteAstronomyNumber)) return null;
  return { id: input.id, name: input.name || input.id, massSolar: input.massSolar, positionAu: position.slice(), velocityAuDay: velocity.slice(), radiusAu: isFiniteAstronomyNumber(input.radiusAu) && input.radiusAu >= 0 ? input.radiusAu : 0, color: input.color || "#ffffff", provenance: input.provenance || "user-defined model" };
}

function createSimulationState(bodies, options) {
  const normalized = (bodies || []).map(createBody).filter(Boolean);
  const ids = new Set(normalized.map((body) => body.id));
  if (ids.size !== normalized.length) throw new Error("Simulation body IDs must be unique.");
  return { schema: "cosmic-atlas.nbody.v1", bodies: normalized, timeJd: isFiniteAstronomyNumber(options?.timeJd) ? options.timeJd : J2000_JD, stepDays: isFiniteAstronomyNumber(options?.stepDays) && options.stepDays > 0 ? options.stepDays : 1, softeningAu: isFiniteAstronomyNumber(options?.softeningAu) && options.softeningAu >= 0 ? options.softeningAu : 0, collisionPolicy: options?.collisionPolicy || "none", integrator: "velocity-verlet", steps: 0 };
}

function cloneSimulationState(state) {
  return createSimulationState(state.bodies.map((body) => ({ ...body, positionAu: body.positionAu.slice(), velocityAuDay: body.velocityAuDay.slice() })), state);
}
