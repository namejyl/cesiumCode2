// 添加高程
let Cesium = proxy.$global().Cesium;
if (node) {
  //开启
  Effects.terrain = new Cesium.CesiumTerrainProvider({
    url: 'http://192.168.3.50:9099/upload/terrain/ync',
    minimumLevel: 0,
    maximumLevel: 15
  });
} else {
  // 关闭
  console.log('EllipsoidTerrainProvider');
  Effects.terrain = new Cesium.EllipsoidTerrainProvider({});
}
proxy.$global().viewer.terrainProvider = Effects.terrain;
