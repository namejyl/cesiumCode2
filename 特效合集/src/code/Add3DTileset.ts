const Cesium = window.Cesium;
export default async () => {
  let viewer = window.viewer;
  const tileset = await Cesium.Cesium3DTileset.fromUrl('/static/3DT/dayanta/tileset.json');
  viewer.scene.primitives.add(tileset);
  tileset.allTilesLoaded.addEventListener(function () {
    console.log('All tiles are loaded');
  });
  viewer.zoomTo(tileset);
};
