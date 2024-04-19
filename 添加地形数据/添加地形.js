// 地形对象
let terrainProvider = new Cesium.CesiumTerrainProvider({
  url: '/terrain'
});
// 添加
viewer.scene.terrainProvider = terrainProvider;
