let importedCatalogRecords = [];
let importedCatalogBundle = buildBufferBundle([], [], []);

function deleteBufferBundle(bundle) {
  if (!bundle) return;
  if (bundle.vboPos) gl.deleteBuffer(bundle.vboPos);
  if (bundle.vboCol) gl.deleteBuffer(bundle.vboCol);
  if (bundle.vboSize) gl.deleteBuffer(bundle.vboSize);
}
