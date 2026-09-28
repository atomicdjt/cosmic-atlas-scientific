let reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" && document.querySelector(".science-modal-backdrop.open")) return;
  if (
    e.key !== "Escape" &&
    /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)
  )
    return;
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  } else if (
    (e.key === "r" || e.key === "R") &&
    document.activeElement !== searchInput
  ) {
    resetView();
  } else if (
    (e.key === "t" || e.key === "T") &&
    document.activeElement !== searchInput
  ) {
    showTourStep(0);
  } else if (
    (e.key === "d" || e.key === "D") &&
    document.activeElement !== searchInput
  ) {
    document.getElementById("data-table-btn").click();
  } else if (e.key === "Escape") {
    document.querySelector(".left-sidebar").classList.remove("mobile-open");
    document.querySelector(".right-sidebar").classList.remove("mobile-open");
    syncMobilePanelAria();
    closeScienceModal();
    closeAtlasDialog(dataModal);
    document.getElementById("tour-panel").classList.remove("open");
    searchResults.style.display = "none";
    if (document.activeElement === searchInput) searchInput.blur();

  }
});
