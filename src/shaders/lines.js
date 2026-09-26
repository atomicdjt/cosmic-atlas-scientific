const lineVS = `
      attribute vec3 aPosition;
      uniform mat4 uMVP;
      void main() {
        gl_Position = uMVP * vec4(aPosition, 1.0);
      }
    `;
const lineFS = `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `;
const lineProg = createProgram(gl, lineVS, lineFS);
const lLoc = {
  pos: gl.getAttribLocation(lineProg, "aPosition"),
  uMVP: gl.getUniformLocation(lineProg, "uMVP"),
  uColor: gl.getUniformLocation(lineProg, "uColor"),
};
