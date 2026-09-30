// Mission scenarios are explicit patched-conic planning inputs. They do not
// claim navigation-grade ephemerides unless a build-time Horizons provenance
// record is attached.
function createMissionScenario(input) {
  if (!input || typeof input.id !== "string" || !input.id || typeof input.name !== "string") return null;
  const departureJd = finiteNumber(input.departureJd), arrivalJd = finiteNumber(input.arrivalJd);
  if (!Number.isFinite(departureJd) || !Number.isFinite(arrivalJd) || arrivalJd <= departureJd) return null;
  return { schema: "cosmic-atlas.mission.v1", id: input.id, name: input.name, departure: input.departure || "Earth", destination: input.destination || "Unknown", departureJd, arrivalJd, originRadiusAu: Number(input.originRadiusAu), destinationRadiusAu: Number(input.destinationRadiusAu), method: input.method || "patched-conic estimate", provenance: input.provenance || "user-defined scenario", limitations: input.limitations || ["Not a navigation solution."], status: input.status || "scenario" };
}
