window.addEventListener("click", (e) => {
  if (e.target.closest(".interactive")) return;
  const r = canvas.getBoundingClientRect(),
    best = pickAt(e.clientX - r.left, e.clientY - r.top);
  if (best) showInspector(best);
});
