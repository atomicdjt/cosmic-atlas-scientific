function simulationDiagnostics(state) {
  let kinetic = 0, momentum = [0, 0, 0], centerOfMass = [0, 0, 0], totalMass = 0;
  state.bodies.forEach((body) => {
    const speedSquared = dotVec3(body.velocityAuDay, body.velocityAuDay);
    kinetic += 0.5 * body.massSolar * speedSquared;
    totalMass += body.massSolar;
    for (let axis = 0; axis < 3; axis++) { momentum[axis] += body.massSolar * body.velocityAuDay[axis]; centerOfMass[axis] += body.massSolar * body.positionAu[axis]; }
  });
  if (totalMass) centerOfMass = centerOfMass.map((value) => value / totalMass);
  const potential = gravitationalPotentialEnergy(state);
  return { units: { energy: "solar mass AU²/day²", momentum: "solar mass AU/day" }, kineticEnergy: kinetic, potentialEnergy: potential, totalEnergy: kinetic + potential, momentum, momentumMagnitude: Math.hypot(...momentum), centerOfMassAu: centerOfMass };
}
