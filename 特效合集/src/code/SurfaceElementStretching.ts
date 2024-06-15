const Cesium = window.Cesium;
export default () => {
  /**
   * 面状要素的立体拉伸效果
   */
  var viewer = window.viewer;
  Cesium.GeoJsonDataSource.load('/static/geojson/财源街道边界.geojson').then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    let entities = dataSource.entities.values;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      // 设置贴地
      entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
      // 设置面的材质
      entity.polygon.material = new Cesium.Color(204 / 255, 247 / 255, 217 / 255, 0.6);
      entity.polygon.outline = false;
      // 将高度拉伸至200米
      entity.polygon.extrudedHeight = 200;
    }
  });
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.08645, 36.179508, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
};
