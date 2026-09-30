function nBodyAccelerations(bodies, softeningAu) {
  const acceleration = bodies.map(() => [0, 0, 0]);
  const epsilonSquared = (softeningAu || 0) ** 2;
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const delta = subtractVec3(bodies[j].positionAu, bodies[i].positionAu);
    const distanceSquared = dotVec3(delta, delta) + epsilonSquared;
    if (!Number.isFinite(distanceSquared) || distanceSquared === 0) throw new Error("Coincident/invalid unsoftened bodies; reduce timestep or use an explicit softened model.");
    const inverseDistanceCubed = 1 / (distanceSquared * Math.sqrt(distanceSquared));
    const factorI = GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 * bodies[j].massSolar * inverseDistanceCubed;
    const factorJ = GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 * bodies[i].massSolar * inverseDistanceCubed;
    for (let axis = 0; axis < 3; axis++) { acceleration[i][axis] += delta[axis] * factorI; acceleration[j][axis] -= delta[axis] * factorJ; }
  }
  return acceleration;
}

function gravitationalPotentialEnergy(state) {
  let potential = 0;
  for (let i = 0; i < state.bodies.length; i++) for (let j = i + 1; j < state.bodies.length; j++) {
    const delta = subtractVec3(state.bodies[j].positionAu, state.bodies[i].positionAu);
    const distance = Math.sqrt(dotVec3(delta, delta) + state.softeningAu ** 2);
    if (distance > 0) potential -= GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 * state.bodies[i].massSolar * state.bodies[j].massSolar / distance;
  }
  return potential;
}
