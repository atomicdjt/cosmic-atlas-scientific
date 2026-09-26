const cmbVS = `
      attribute vec3 aPosition;
      uniform mat4 uMVP;
      varying vec3 vPos;
      void main() {
        vPos = normalize(aPosition);
        gl_Position = uMVP * vec4(aPosition, 1.0);
      }
    `;
const cmbFS = `
      precision mediump float;
      varying vec3 vPos;
      uniform float uTime;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }

      vec3 planckPalette(float t) {
        vec3 darkBlue = vec3(0.02, 0.05, 0.35);
        vec3 cyan     = vec3(0.10, 0.55, 0.85);
        vec3 green    = vec3(0.20, 0.80, 0.50);
        vec3 orange   = vec3(0.95, 0.65, 0.15);
        vec3 red      = vec3(0.90, 0.15, 0.15);
        if (t < 0.25) return mix(darkBlue, cyan, t * 4.0);
        if (t < 0.50) return mix(cyan, green, (t - 0.25) * 4.0);
        if (t < 0.75) return mix(green, orange, (t - 0.50) * 4.0);
        return mix(orange, red, (t - 0.75) * 4.0);
      }

      void main() {
        float n = 0.0;
        n += 0.500 * noise(vPos * 8.0);
        n += 0.250 * noise(vPos * 16.0);
        n += 0.125 * noise(vPos * 32.0);
        vec3 col = planckPalette(clamp(n, 0.0, 1.0));
        gl_FragColor = vec4(col, 0.38);
      }
    `;
const cmbProg = createProgram(gl, cmbVS, cmbFS);
const cLoc = {
  pos: gl.getAttribLocation(cmbProg, "aPosition"),
  uMVP: gl.getUniformLocation(cmbProg, "uMVP"),
  uTime: gl.getUniformLocation(cmbProg, "uTime"),
};
