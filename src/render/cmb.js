const cmbVerts = [];
const cmbRadius = distToSceneRadius(CMB_DISTANCE_LY);
const lats = 36,
  lons = 48;
for (let i = 0; i < lats; i++) {
  const theta1 = (i / lats) * Math.PI;
  const theta2 = ((i + 1) / lats) * Math.PI;
  for (let j = 0; j < lons; j++) {
    const phi1 = (j / lons) * Math.PI * 2;
    const phi2 = ((j + 1) / lons) * Math.PI * 2;

    const p1 = [
      cmbRadius * Math.sin(theta1) * Math.cos(phi1),
      cmbRadius * Math.cos(theta1),
      cmbRadius * Math.sin(theta1) * Math.sin(phi1),
    ];
    const p2 = [
      cmbRadius * Math.sin(theta2) * Math.cos(phi1),
      cmbRadius * Math.cos(theta2),
      cmbRadius * Math.sin(theta2) * Math.sin(phi1),
    ];
    const p3 = [
      cmbRadius * Math.sin(theta2) * Math.cos(phi2),
      cmbRadius * Math.cos(theta2),
      cmbRadius * Math.sin(theta2) * Math.sin(phi2),
    ];
    const p4 = [
      cmbRadius * Math.sin(theta1) * Math.cos(phi2),
      cmbRadius * Math.cos(theta1),
      cmbRadius * Math.sin(theta1) * Math.sin(phi2),
    ];

    cmbVerts.push(
      p1[0],
      p1[1],
      p1[2],
      p2[0],
      p2[1],
      p2[2],
      p3[0],
      p3[1],
      p3[2],
    );
    cmbVerts.push(
      p1[0],
      p1[1],
      p1[2],
      p3[0],
      p3[1],
      p3[2],
      p4[0],
      p4[1],
      p4[2],
    );
  }
}
const vboCMB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vboCMB);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cmbVerts), gl.STATIC_DRAW);
const cmbVertexCount = cmbVerts.length / 3;
