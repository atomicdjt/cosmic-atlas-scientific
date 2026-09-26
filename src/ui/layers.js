const layers = {
  catalog: true,
  imported: true,
  context: true,
  stars: true,
  galaxy: true,
  localgroup: true,
  filaments: true,
  cmb: true,
  grid: true,
};
document
  .getElementById("layer-catalog")
  .addEventListener("change", (e) => (layers.catalog = e.target.checked));
document
  .getElementById("layer-imported")
  .addEventListener("change", (e) => (layers.imported = e.target.checked));
document
  .getElementById("layer-context")
  .addEventListener("change", (e) => (layers.context = e.target.checked));
document
  .getElementById("layer-stars")
  .addEventListener("change", (e) => (layers.stars = e.target.checked));
document
  .getElementById("layer-galaxy")
  .addEventListener("change", (e) => (layers.galaxy = e.target.checked));
document
  .getElementById("layer-localgroup")
  .addEventListener("change", (e) => (layers.localgroup = e.target.checked));
document
  .getElementById("layer-filaments")
  .addEventListener("change", (e) => (layers.filaments = e.target.checked));
document
  .getElementById("layer-cmb")
  .addEventListener("change", (e) => (layers.cmb = e.target.checked));
document
  .getElementById("layer-grid")
  .addEventListener("change", (e) => (layers.grid = e.target.checked));

let simSpeed = 1.0;
document.getElementById("sim-speed").addEventListener("input", (e) => {
  simSpeed = parseFloat(e.target.value);
  document.getElementById("speed-val").innerText = simSpeed.toFixed(1) + "x";
});

let particleBrightness = 1.0;
document
  .getElementById("particle-brightness")
  .addEventListener("input", (e) => {
    particleBrightness = parseFloat(e.target.value);
    document.getElementById("bright-val").innerText =
      particleBrightness.toFixed(1);
  });
