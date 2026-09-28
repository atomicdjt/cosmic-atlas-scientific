const matProj = Mat4.create();
const matView = Mat4.create();
const matMVP = Mat4.create();

let cssViewportWidth = window.innerWidth;
let cssViewportHeight = window.innerHeight;
let renderDpr = 1.0;

function resizeCanvas() {
  cssViewportWidth = Math.max(1, window.innerWidth);
  cssViewportHeight = Math.max(1, window.innerHeight);
  renderDpr = Math.min(
    window.innerWidth < 700 ? 1.5 : 2.0,
    Math.max(1.0, window.devicePixelRatio || 1.0),
  );
  renderDpr *= denseRenderDetail.resolutionScale;
  const width = Math.round(cssViewportWidth * renderDpr);
  const height = Math.round(cssViewportHeight * renderDpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

function projectToScreen(pos, m = matMVP, width = cssViewportWidth, height = cssViewportHeight) {
  const x = pos[0],
    y = pos[1],
    z = pos[2];
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cz = m[2] * x + m[6] * y + m[10] * z + m[14];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];

  if (cw <= 0.0) return null;
  const nx = cx / cw,
    ny = cy / cw,
    nz = cz / cw;
  if (
    nx < -1.08 ||
    nx > 1.08 ||
    ny < -1.08 ||
    ny > 1.08 ||
    nz < -1.2 ||
    nz > 1.2
  )
    return null;
  return [
    (nx * 0.5 + 0.5) * width,
    (-ny * 0.5 + 0.5) * height,
  ];
}
