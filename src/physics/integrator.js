function velocityVerletStep(state, stepDays) {
  const dt = isFiniteAstronomyNumber(stepDays) && stepDays > 0 ? stepDays : state.stepDays;
  if (stepDays!==undefined && (!isFiniteAstronomyNumber(stepDays) || stepDays<=0)) throw new Error("Positive finite timestep required.");
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
  if (!Number.isFinite(next.timeJd) || next.timeJd<=state.timeJd) throw new Error("Timestep outside supported Julian-date precision.");
  next.steps += 1;
  if (!next.bodies.every(body=>body.positionAu.concat(body.velocityAuDay).every(Number.isFinite))) throw new Error("Integration overflow; state not committed.");
  next.category="numerically integrated model";
  return next;
}

function advanceSimulation(state, durationDays, maxSteps) {
  if (!Number.isFinite(durationDays) || durationDays<0 || maxSteps!==undefined && (!Number.isInteger(maxSteps)||maxSteps<1)) throw new Error("Invalid integration duration/step budget.");
  const total = durationDays, step = state.stepDays;
  const steps = Math.ceil(total / step);
  if (steps>(maxSteps || 100000)) throw new Error("Integration exceeds step budget; request a shorter duration.");
  let result = state;
  for (let index = 0; index < steps; index++) result = velocityVerletStep(result, Math.min(step, total - index * step));
  return result;
}
