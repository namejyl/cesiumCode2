const Cesium = window.Cesium;
const Add3DTileset = async () => {
  let viewer = window.viewer;
  const tileset = await Cesium.Cesium3DTileset.fromUrl('/static/3DT/dayanta/tileset.json');
  viewer.scene.primitives.add(tileset);
  tileset.allTilesLoaded.addEventListener(function () {
    console.log('All tiles are loaded');
  });
  viewer.zoomTo(tileset);
};
export default Add3DTileset;
