function simulationDiagnostics(state) {
  let kinetic = 0, momentum = [0, 0, 0], angularMomentum=[0,0,0], centerOfMass = [0, 0, 0], totalMass = 0;
  state.bodies.forEach((body) => {
    const speedSquared = dotVec3(body.velocityAuDay, body.velocityAuDay);
    kinetic += 0.5 * body.massSolar * speedSquared;
    totalMass += body.massSolar;
    const angular=crossVec3(body.positionAu,body.velocityAuDay);
    for (let axis=0;axis<3;axis++) angularMomentum[axis]+=body.massSolar*angular[axis];
    for (let axis = 0; axis < 3; axis++) { momentum[axis] += body.massSolar * body.velocityAuDay[axis]; centerOfMass[axis] += body.massSolar * body.positionAu[axis]; }
  });
  if (totalMass) centerOfMass = centerOfMass.map((value) => value / totalMass);
  const potential = gravitationalPotentialEnergy(state);
  return { units: { energy: "solar mass AU²/day²", momentum: "solar mass AU/day", angularMomentum:"solar mass AU²/day" }, kineticEnergy: kinetic, potentialEnergy: potential, totalEnergy: kinetic + potential, momentum, momentumMagnitude: Math.hypot(...momentum), angularMomentum, angularMomentumMagnitude:Math.hypot(...angularMomentum),totalMassSolar:totalMass, centerOfMassAu: centerOfMass };
}

function simulationQuality(state, initial, initialJd) {
  const current=simulationDiagnostics(state),duration=state.timeJd-initialJd;
  const expected=initial.centerOfMassAu.map((x,i)=>x+initial.momentum[i]/initial.totalMassSolar*duration);
  return {solver:state.integrator,stepDays:state.stepDays,softeningAu:state.softeningAu,steps:state.steps,durationDays:duration,
    energyRelativeDrift:initial.totalEnergy!==0?(current.totalEnergy-initial.totalEnergy)/Math.abs(initial.totalEnergy):null,
    angularMomentumRelativeDrift:initial.angularMomentumMagnitude>0 ? Math.hypot(...subtractVec3(current.angularMomentum,initial.angularMomentum))/initial.angularMomentumMagnitude:null,
    momentumAbsoluteDrift:Math.hypot(...subtractVec3(current.momentum,initial.momentum)),
    centerOfMassResidualAu:Math.hypot(...subtractVec3(current.centerOfMassAu,expected)),
    category:state.category || "defined pedagogical initial conditions",
    scientificMetadata:{category:state.steps>0?"numerically integrated model":"numerically computed",
      source:state.sourceProvenance??state.bodies.map(b=>b.provenance),epoch:state.timeJd,
      timeScale:state.timeScale || "model Julian days",frame:state.frame || "defined model axes",units:PHYSICS_UNITS,
      method:"fixed-step velocity-Verlet; Newtonian pair gravity",assumptions:["No collision, relativity, tides or non-gravitational force",
        "Optional Plummer softening is a modified force model", "Conservation residuals do not measure trajectory accuracy"],uncertainty:null,validRange:null}};
}
