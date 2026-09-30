// Small-system N-body state in AU, solar masses and Julian days. This unit
// system keeps values well-conditioned and makes the gravitational constant
// explicit. The lab is not a solar-system ephemeris.
const PHYSICS_UNITS = Object.freeze({ distance: "AU", mass: "solar mass", time: "Julian day", velocity: "AU/day" });
const GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 = 2.959122082855911e-4;

function createBody(input) {
  if (!input || typeof input.id !== "string" || !input.id || !isFiniteAstronomyNumber(input.massSolar) || input.massSolar <= 0) return null;
  const position = input.positionAu, velocity = input.velocityAuDay;
  if (!Array.isArray(position) || !Array.isArray(velocity) || position.length !== 3 || velocity.length !== 3 || !position.concat(velocity).every(isFiniteAstronomyNumber)) return null;
  return { id: input.id, name: input.name || input.id, massSolar: input.massSolar, positionAu: position.slice(), velocityAuDay: velocity.slice(), radiusAu: isFiniteAstronomyNumber(input.radiusAu) && input.radiusAu >= 0 ? input.radiusAu : null, color: input.color || "#ffffff", provenance: input.provenance || "user-defined model" };
}

function createSimulationState(bodies, options) {
  if (!Array.isArray(bodies) || !bodies.length || bodies.length>64) throw new Error("Provide 1–64 valid simulation bodies.");
  const normalized = bodies.map(createBody);
  if (normalized.some(body=>!body)) throw new Error("Invalid simulation body; no rows silently discarded.");
  for (const field of ["timeJd","stepDays","softeningAu"]) {
    if (options?.[field]!==undefined && !isFiniteAstronomyNumber(options[field])) throw new Error("Invalid simulation "+field);
  }
  if (options?.stepDays!==undefined && options.stepDays<=0 || options?.softeningAu!==undefined && options.softeningAu<0)
    throw new Error("Invalid timestep/softening.");
  if (options?.collisionPolicy && options.collisionPolicy!=="none") throw new Error("Collision policies unsupported.");
  const ids = new Set(normalized.map((body) => body.id));
  if (ids.size !== normalized.length) throw new Error("Simulation body IDs must be unique.");
  return { schema: "cosmic-atlas.nbody.v1", units: PHYSICS_UNITS, timeScale: options?.timeScale || "model Julian days", frame: options?.frame || "defined model axes", bodies: normalized, timeJd: isFiniteAstronomyNumber(options?.timeJd) ? options.timeJd : J2000_JD, stepDays: isFiniteAstronomyNumber(options?.stepDays) && options.stepDays > 0 ? options.stepDays : 1, softeningAu: isFiniteAstronomyNumber(options?.softeningAu) && options.softeningAu >= 0 ? options.softeningAu : 0, collisionPolicy: options?.collisionPolicy || "none", integrator: "velocity-verlet", steps: 0 };
}

function cloneSimulationState(state) {
  return {...state, bodies:state.bodies.map(body=>({...body,positionAu:body.positionAu.slice(),velocityAuDay:body.velocityAuDay.slice()}))};
}
