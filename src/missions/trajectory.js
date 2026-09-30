function hohmannTransferEstimate(originRadiusAu, destinationRadiusAu) {
  const r1 = Number(originRadiusAu), r2 = Number(destinationRadiusAu);
  if (!Number.isFinite(r1) || !Number.isFinite(r2) || !(r1 > 0 && r2 > 0)) return null;
  const transferSemiMajorAu = (r1 + r2) / 2;
  const timeDays = Math.PI * Math.sqrt(transferSemiMajorAu ** 3 / GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2);
  const circular1 = Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 / r1);
  const circular2 = Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 / r2);
  const transfer1 = Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 * (2 / r1 - 1 / transferSemiMajorAu));
  const transfer2 = Math.sqrt(GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2 * (2 / r2 - 1 / transferSemiMajorAu));
  return { method: "coplanar circular Hohmann estimate", timeDays, deltaVAuDay: Math.abs(transfer1 - circular1) + Math.abs(circular2 - transfer2), assumptions: ["two-body heliocentric dynamics", "coplanar circular endpoint orbits", "impulsive maneuvers", "no launch-window or planetary-encounter modeling"] };
}

function missionTimeline(scenario) {
  const valid = createMissionScenario(scenario);
  if (!valid) return null;
  const transfer = hohmannTransferEstimate(valid.originRadiusAu, valid.destinationRadiusAu);
  return { scenario: valid, durationDays: valid.arrivalJd - valid.departureJd, estimate: transfer, events: [{ jd: valid.departureJd, label: "Departure: " + valid.departure }, { jd: valid.arrivalJd, label: "Arrival: " + valid.destination }] };
}
