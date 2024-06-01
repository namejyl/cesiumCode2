const Cesium = window.Cesium;
const AddContourLines = () => {
  let viewer = window.viewer;
  // 要绘制的目标高度
  var height = 1000.0;
  // 创建一个Entity来表示我们的等高线（这里只是为了可视化，实际上不需要这个）
  var entity = viewer.entities.add({
    name: '等高线',
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        // 这里填入经纬度数组，表示等高线的路径
      ]),
      width: 3.0,
      material: Cesium.Color.RED
    }
  });
  // 计算等高线的经纬度数组
  var positions = [];
  var terrainProvider = viewer.terrainProvider;
  var scene = viewer.scene;
  Cesium.sampleTerrain(terrainProvider, 11, [Cesium.Cartographic.fromDegrees(-75.0, 40.0), Cesium.Cartographic.fromDegrees(-125.0, 40.0)]).then(function (updatedPositions) {
    for (var i = 0; i < updatedPositions.length; i++) {
      var cartographic = updatedPositions[i];
      if (Cesium.defined(cartographic)) {
        cartographic.height = height;
        positions.push(cartographic);
      }
    }
    // 更新Entity的polyline.positions
    entity.polyline.positions = positions;
  });
};
export default AddContourLines;
