const camera = {
  target: [0, 0, 0],
  dist: 45.0,
  theta: 0.8,
  phi: 0.35,
  targetDist: 45.0,
  targetTheta: 0.8,
  targetPhi: 0.35,
  lookTarget: [0, 0, 0],
  animating: false,
  animStartDist: 45.0,
  animStartLook: [0, 0, 0],
  animEndDist: 45.0,
  animEndLook: [0, 0, 0],
  animProgress: 1.0,
};

function flyToScale(targetDist, targetLook) {
  camera.animStartDist = camera.dist;
  camera.animStartLook = [
    camera.lookTarget[0],
    camera.lookTarget[1],
    camera.lookTarget[2],
  ];
  camera.animEndDist = targetDist;
  camera.animEndLook = [targetLook[0], targetLook[1], targetLook[2]];
  camera.animProgress = reduceMotion ? 1.0 : 0.0;
  camera.animating = true;
}

let isDragging = false;
let prevMouseX = 0,
  prevMouseY = 0;
let pinchDistStart = 0;

window.addEventListener("mousedown", (e) => {
  if (e.target.closest(".interactive")) return;
  isDragging = true;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouseX;
  const dy = e.clientY - prevMouseY;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;

  camera.targetTheta += dx * 0.006;
  camera.targetPhi = Math.max(
    -Math.PI * 0.48,
    Math.min(Math.PI * 0.48, camera.targetPhi + dy * 0.006),
  );
});

window.addEventListener("mouseup", () => (isDragging = false));

window.addEventListener(
  "wheel",
  (e) => {
    if (e.target.closest(".interactive")) return;
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    camera.targetDist = Math.max(
      1.0,
      Math.min(2600.0, camera.targetDist * factor),
    );
  },
  { passive: true },
);
