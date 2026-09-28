const canvas = document.getElementById("webgl-canvas");
const runtimeMessage = document.getElementById("runtime-message");

function showRuntimeMessage(title, detail) {
  runtimeMessage.innerHTML = `<strong>${title}</strong><br>${detail}`;
  runtimeMessage.style.display = "block";
}

let gl =
  canvas.getContext("webgl", {
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  }) || canvas.getContext("experimental-webgl");

if (!gl) {
  showRuntimeMessage(
    "WebGL is unavailable.",
    "Cosmic Atlas needs WebGL enabled in this browser. Try a current Chrome, Edge, Firefox, or Safari build with hardware acceleration enabled.",
  );
  throw new Error("WebGL unavailable");
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info =
      gl.getShaderInfoLog(shader) || "Unknown shader compilation error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info =
      gl.getProgramInfoLog(prog) || "Unknown WebGL program link error";
    gl.deleteProgram(prog);
    throw new Error(info);
  }
  return prog;
}
