const particleVS = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute float aSize;
      uniform mat4 uMVP;
      uniform float uHeight;
      uniform float uBrightness;
      uniform float uMaxPointSize;
      varying vec3 vColor;
      void main() {
        gl_Position = uMVP * vec4(aPosition, 1.0);
        float w = gl_Position.w;
        if (w > 0.0) {
          gl_PointSize = clamp(aSize * (uHeight / (w * 0.9 + 25.0)), 1.5, uMaxPointSize);
        } else {
          gl_PointSize = 0.0;
        }
        vColor = aColor * uBrightness;
      }
    `;

const particleFS = `
      precision mediump float;
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d2 = dot(c, c);
        if (d2 > 0.25) discard;
        float alpha = exp(-d2 * 14.0);
        float core = exp(-d2 * 55.0);
        vec3 col = mix(vColor, vec3(1.0), core * 0.85);
        gl_FragColor = vec4(col, alpha);
      }
    `;

const particleProg = createProgram(gl, particleVS, particleFS);
const pLoc = {
  pos: gl.getAttribLocation(particleProg, "aPosition"),
  col: gl.getAttribLocation(particleProg, "aColor"),
  size: gl.getAttribLocation(particleProg, "aSize"),
  uMVP: gl.getUniformLocation(particleProg, "uMVP"),
  uHeight: gl.getUniformLocation(particleProg, "uHeight"),
  uBrightness: gl.getUniformLocation(particleProg, "uBrightness"),
  uMaxPointSize: gl.getUniformLocation(particleProg, "uMaxPointSize"),
};
