for (const modal of [dataModal, scienceModal]) {
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const els = [
      ...modal.querySelectorAll('button,input,select,a[href],[tabindex="0"]'),
    ].filter((x) => x.offsetParent !== null);
    if (!els.length) return;
    const first = els[0],
      last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
canvas.setAttribute(
  "aria-label",
  "Cosmic Atlas sky visualization. Use catalog search and data table for keyboard access.",
);
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  showRuntimeMessage(
    "Graphics context lost",
    "Reload the page to restore rendering. Export your catalog before reloading if possible.",
  );
});
