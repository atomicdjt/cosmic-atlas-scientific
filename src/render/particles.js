function drawBufferBundle(bundle) {
  gl.uniform1f(
    pLoc.uMaxPointSize,
    bundle === importedCatalogBundle ? (bundle.count > 20000 ? 4 : 8) : 20,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboPos);
  gl.enableVertexAttribArray(pLoc.pos);
  gl.vertexAttribPointer(pLoc.pos, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboCol);
  gl.enableVertexAttribArray(pLoc.col);
  gl.vertexAttribPointer(pLoc.col, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboSize);
  gl.enableVertexAttribArray(pLoc.size);
  gl.vertexAttribPointer(pLoc.size, 1, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, bundle.count);
}
