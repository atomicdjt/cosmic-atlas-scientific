const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("keydown", (e) => {
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
    populateDataTable(dataSearch.value);
    dataModal.classList.add("open");
  } else if (e.key === "Escape") {
    closeScienceModal();
    dataModal.classList.remove("open");
    document.getElementById("tour-panel").classList.remove("open");
    searchResults.style.display = "none";
    searchInput.blur();
    document.querySelector(".left-sidebar").classList.remove("mobile-open");
    document.querySelector(".right-sidebar").classList.remove("mobile-open");
    syncMobilePanelAria();
  }
});
