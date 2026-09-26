const telemetryBtn = document.getElementById("toggle-telemetry-btn");
const inspectorBtn = document.getElementById("toggle-inspector-btn");

function syncMobilePanelAria() {
  telemetryBtn.setAttribute(
    "aria-expanded",
    document.querySelector(".left-sidebar").classList.contains("mobile-open")
      ? "true"
      : "false",
  );
  inspectorBtn.setAttribute(
    "aria-expanded",
    document.querySelector(".right-sidebar").classList.contains("mobile-open")
      ? "true"
      : "false",
  );
}

telemetryBtn.addEventListener("click", () => {
  const left = document.querySelector(".left-sidebar");
  const right = document.querySelector(".right-sidebar");
  left.classList.toggle("mobile-open");
  right.classList.remove("mobile-open");
  syncMobilePanelAria();
});

inspectorBtn.addEventListener("click", () => {
  const left = document.querySelector(".left-sidebar");
  const right = document.querySelector(".right-sidebar");
  right.classList.toggle("mobile-open");
  left.classList.remove("mobile-open");
  syncMobilePanelAria();
});
