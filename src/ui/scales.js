const sgraCoord = CELESTIAL_CATALOG.find((c) => c.id === "sgra").pos;
const scalePresets = [
  { name: "Solar System & Stars", dist: 38.0, look: [0, 0, 0], id: "sol" },
  { name: "Milky Way Galaxy", dist: 220.0, look: sgraCoord, id: "sgra" },
  { name: "Local Group", dist: 450.0, look: andromedaCoord, id: "andromeda" },
  {
    name: "Laniakea & Superclusters",
    dist: 750.0,
    look: clusterNodes[0],
    id: "virgo_cluster",
  },
  {
    name: "Cosmic Web & Filaments",
    dist: 1200.0,
    look: [0, 0, 0],
    id: "sloan_wall",
  },
  {
    name: "CMB Last-Scattering Surface",
    dist: 2200.0,
    look: [0, 0, 0],
    id: "cmb_horizon",
  },
];

let currentScale = 0;
const scaleBtns = document.querySelectorAll(".scale-btn");
scaleBtns.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    currentScale = idx;
    scaleBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const p = scalePresets[idx];
    flyToScale(p.dist, p.look);
    const match = CELESTIAL_CATALOG.find((c) => c.id === p.id);
    if (match) showInspector(match);
  });
});

let selectedItem = CELESTIAL_CATALOG[0];
const reticle = document.getElementById("selection-reticle");
let measureA = null,
  measureB = null;
