const TOUR_STEPS = [
  {
    scale: 0,
    id: "sol",
    title: "Solar neighborhood",
    copy: "Begin at the observer-centered origin. Nearby directions are catalog grounded; the dense local star field remains procedural unless an external catalog is loaded.",
  },
  {
    scale: 1,
    id: "sgra",
    title: "Milky Way",
    copy: "The Galaxy is rendered around Sagittarius A*, keeping the Sun off-center. Disk particles are illustrative geometry; catalog landmarks retain measured directions and adopted distances.",
  },
  {
    scale: 2,
    id: "andromeda",
    title: "Local Group",
    copy: "Move to M31 and neighboring Local Group scales. Published geometric distances are preferred here because local peculiar velocities make redshift a poor distance estimator.",
  },
  {
    scale: 3,
    id: "virgo_cluster",
    title: "Supercluster context",
    copy: "At tens to hundreds of millions of light-years, contextual landmarks help navigation. Gold markers are explicitly not precision centroids or substitutes for member-galaxy catalogs.",
  },
  {
    scale: 4,
    id: "sloan_wall",
    title: "Large-scale structure",
    copy: "The filament network is procedural context, not a reconstruction of SDSS or DESI survey data. Future catalog imports can add real galaxy samples without changing the renderer.",
  },
  {
    scale: 5,
    id: "cmb_horizon",
    title: "Last scattering",
    copy: "The CMB sphere is placed at the model comoving distance for z≈1089 under the release cosmology. Its texture is procedural and is not Planck sky-map data.",
  },
];
let tourIndex = 0;
function showTourStep(idx) {
  tourIndex = (idx + TOUR_STEPS.length) % TOUR_STEPS.length;
  const st = TOUR_STEPS[tourIndex];
  document.getElementById("tour-kicker").innerText =
    `Guided tour • ${tourIndex + 1}/${TOUR_STEPS.length}`;
  document.getElementById("tour-title").innerText = st.title;
  document.getElementById("tour-copy").innerText = st.copy;
  const p = scalePresets[st.scale];
  flyToScale(p.dist, p.look);
  scaleBtns.forEach((b, i) => b.classList.toggle("active", i === st.scale));
  const item = CELESTIAL_CATALOG.find((x) => x.id === st.id);
  if (item) showInspector(item);
  document.getElementById("tour-panel").classList.add("open");
}
document
  .getElementById("tour-btn")
  .addEventListener("click", () => showTourStep(0));
document
  .getElementById("tour-prev-btn")
  .addEventListener("click", () => showTourStep(tourIndex - 1));
document
  .getElementById("tour-next-btn")
  .addEventListener("click", () => showTourStep(tourIndex + 1));
document
  .getElementById("tour-close-btn")
  .addEventListener("click", () =>
    document.getElementById("tour-panel").classList.remove("open"),
  );
