window.addEventListener(
  "touchstart",
  (e) => {
    if (e.target.closest(".interactive")) return;
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      pinchDistStart = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest(".interactive")) return;
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      camera.targetTheta += dx * 0.007;
      camera.targetPhi = Math.max(
        -Math.PI * 0.48,
        Math.min(Math.PI * 0.48, camera.targetPhi + dy * 0.007),
      );
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (pinchDistStart > 0) {
        const factor = pinchDistStart / dist;
        camera.targetDist = Math.max(
          1.0,
          Math.min(2600.0, camera.targetDist * Math.pow(factor, 0.25)),
        );
      }
      pinchDistStart = dist;
    }
  },
  { passive: true },
);

window.addEventListener("touchend", () => {
  isDragging = false;
  pinchDistStart = 0;
});
