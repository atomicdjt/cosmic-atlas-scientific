const searchInput = document.getElementById("object-search");
const searchResults = document.getElementById("search-results");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) {
    searchResults.style.display = "none";
    return;
  }
  const matches = visibleScientificRecords()
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.source || "").toLowerCase().includes(q) ||
        (c.record || "").toLowerCase().includes(q) ||
        (c.externalId || "").toLowerCase().includes(q),
    )
    .slice(0, 60);

  if (matches.length === 0) {
    searchResults.innerHTML =
      '<div style="padding:7px 10px;color:var(--text-dim);font-size:11px">No catalog match</div>';
    searchResults.style.display = "block";
    return;
  }

  searchResults.innerHTML = matches
    .map(
      (m) => `
        <button type="button" class="search-item" data-id="${escapeHtml(m.id)}">
          <span>${escapeHtml(m.name)}</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">${m.angularOnly ? "angular-only" : formatDistance(m.distLy)}</span>
        </button>
      `,
    )
    .join("");
  searchResults.style.display = "block";

  searchResults.querySelectorAll(".search-item").forEach((el) => {
    el.addEventListener("click", () => {
      const match = allScientificRecords().find((c) => c.id === el.dataset.id);
      if (match) {
        showInspector(match);
        const targetDist = Math.max(
          15.0,
          distToSceneRadius(match.distLy) * 0.25,
        );
        flyToScale(targetDist, match.pos);
      }
      searchResults.style.display = "none";
      searchInput.value = "";
      searchInput.focus();
    });
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) {
    searchResults.style.display = "none";
  }
});
