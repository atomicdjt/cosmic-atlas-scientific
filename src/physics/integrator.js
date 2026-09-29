function velocityVerletStep(state, stepDays) {
  const dt = isFiniteAstronomyNumber(stepDays) && stepDays > 0 ? stepDays : state.stepDays;
  const next = cloneSimulationState(state);
  const before = nBodyAccelerations(next.bodies, next.softeningAu);
  next.bodies.forEach((body, index) => {
    for (let axis = 0; axis < 3; axis++) body.positionAu[axis] += body.velocityAuDay[axis] * dt + 0.5 * before[index][axis] * dt * dt;
  });
  const after = nBodyAccelerations(next.bodies, next.softeningAu);
  next.bodies.forEach((body, index) => {
    for (let axis = 0; axis < 3; axis++) body.velocityAuDay[axis] += 0.5 * (before[index][axis] + after[index][axis]) * dt;
  });
  next.timeJd += dt;
  next.steps += 1;
  return next;
}

function advanceSimulation(state, durationDays, maxSteps) {
  const total = Math.max(0, durationDays || 0), step = state.stepDays;
  const steps = Math.min(Math.ceil(total / step), maxSteps || 100000);
  let result = state;
  for (let index = 0; index < steps; index++) result = velocityVerletStep(result, Math.min(step, total - index * step));
  return result;
}
