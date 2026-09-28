let lastTime = performance.now();
let lastTelemetry = 0;
const frameDurations = [];

function render(now) {
  requestAnimationFrame(render);
  frameDurations.push(now - lastTime);
  if (frameDurations.length > 600) frameDurations.shift();
  const dt = Math.min(0.1, (now - lastTime) * 0.001);
  lastTime = now;

  resizeCanvas();

  if (camera.animating) {
    camera.animProgress += dt * 1.2;
    if (camera.animProgress >= 1.0) {
      camera.animProgress = 1.0;
      camera.animating = false;
    }
    const t =
      camera.animProgress < 0.5
        ? 4 * camera.animProgress * camera.animProgress * camera.animProgress
        : 1 - Math.pow(-2 * camera.animProgress + 2, 3) / 2;

    camera.dist =
      camera.animStartDist + (camera.animEndDist - camera.animStartDist) * t;
    camera.targetDist = camera.dist;
    camera.lookTarget[0] =
      camera.animStartLook[0] +
      (camera.animEndLook[0] - camera.animStartLook[0]) * t;
    camera.lookTarget[1] =
      camera.animStartLook[1] +
      (camera.animEndLook[1] - camera.animStartLook[1]) * t;
    camera.lookTarget[2] =
      camera.animStartLook[2] +
      (camera.animEndLook[2] - camera.animStartLook[2]) * t;
  } else {
    camera.dist += (camera.targetDist - camera.dist) * (reduceMotion ? 1 : 0.12);
    camera.theta += (camera.targetTheta - camera.theta) * (reduceMotion ? 1 : 0.14);
    camera.phi += (camera.targetPhi - camera.phi) * (reduceMotion ? 1 : 0.14);
  }

  if (!reduceMotion && simSpeed > 0 && !camera.animating && !isDragging) {
    camera.targetTheta += dt * 0.015 * simSpeed;
  }

  const eyeX =
    camera.lookTarget[0] +
    camera.dist * Math.cos(camera.phi) * Math.sin(camera.theta);
  const eyeY = camera.lookTarget[1] + camera.dist * Math.sin(camera.phi);
  const eyeZ =
    camera.lookTarget[2] +
    camera.dist * Math.cos(camera.phi) * Math.cos(camera.theta);

  Mat4.perspective(
    matProj,
    Math.PI * 0.32,
    cssViewportWidth / cssViewportHeight,
    0.1,
    8000.0,
  );
  Mat4.lookAt(matView, [eyeX, eyeY, eyeZ], camera.lookTarget, [0, 1, 0]);
  Mat4.multiply(matMVP, matProj, matView);

  updatePickIndex(now);
  updateRenderDetail(now);
  gl.clearColor(0.012, 0.02, 0.04, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.disable(gl.DEPTH_TEST);

  gl.useProgram(particleProg);
  gl.uniformMatrix4fv(pLoc.uMVP, false, matMVP);
  gl.uniform1f(pLoc.uHeight, canvas.height);
  gl.uniform1f(pLoc.uBrightness, particleBrightness);

  if (layers.catalog) drawBufferBundle(observedCatalogBundle);
  if (layers.imported && importedCatalogBundle.count)
    drawBufferBundle(importedCatalogBundle);
  if (layers.context) drawBufferBundle(contextCatalogBundle);
  if (layers.stars) drawBufferBundle(localStarsBundle);
  if (layers.galaxy && camera.dist > 90) {
    drawBufferBundle(mwBundle);
  }
  if (layers.localgroup && camera.dist > 180) {
    drawBufferBundle(localGroupBundle);
  }
  if (layers.filaments && camera.dist > 400) {
    drawBufferBundle(filamentsBundle);
  }

  if (layers.grid) {
    gl.useProgram(lineProg);
    gl.uniformMatrix4fv(lLoc.uMVP, false, matMVP);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboRings);
    gl.enableVertexAttribArray(lLoc.pos);
    gl.vertexAttribPointer(lLoc.pos, 3, gl.FLOAT, false, 0, 0);

    ringRanges.forEach((r) => {
      gl.uniform4f(lLoc.uColor, 0.24, 0.44, 0.72, r.d >= 1e9 ? 0.35 : 0.18);
      gl.drawArrays(gl.LINE_STRIP, r.start, r.count);
    });
  }

  if (layers.cmb && camera.dist > 700) {
    gl.useProgram(cmbProg);
    gl.uniformMatrix4fv(cLoc.uMVP, false, matMVP);
    gl.uniform1f(cLoc.uTime, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCMB);
    gl.enableVertexAttribArray(cLoc.pos);
    gl.vertexAttribPointer(cLoc.pos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, cmbVertexCount);
  }

  const camDistLy = sceneRadiusToDist(camera.dist);
  const z = distToRedshift(camDistLy);
  const lookback = distToLookback(camDistLy);
  const a = 1.0 / (1.0 + z);

  if (now - lastTelemetry > 150) {
    lastTelemetry = now;
    document.getElementById("hud-dist").innerText = formatDistance(camDistLy);
    document.getElementById("hud-lookback").innerText =
      formatLookback(lookback);
    document.getElementById("hud-redshift").innerText =
      z >= 1000 ? `z ≈ ${z.toExponential(2)}` : `z = ${z.toFixed(4)}`;
    document.getElementById("hud-scale-factor").innerText =
      `${a.toFixed(4)} (${(a * 100).toFixed(1)}%)`;
    document.getElementById("hud-realm").innerText = getRealmName(camDistLy);
  }
  if (selectedItem && selectedItem.pos) {
    const sp = projectToScreen(selectedItem.pos);
    if (sp) {
      reticle.style.left = `${sp[0]}px`;
      reticle.style.top = `${sp[1]}px`;
      reticle.style.display = "block";
    } else {
      reticle.style.display = "none";
    }
  } else {
    reticle.style.display = "none";
  }
}

requestAnimationFrame(render);
