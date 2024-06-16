const Cesium = window.Cesium;
export default () => {
  let viewer = window.Viewer;
  var osmProvider = new Cesium.UrlTemplateImageryProvider({
    url: '/xyz/{z}/{x}/{y}.png'
  });
  viewer.imageryLayers.addImageryProvider(osmProvider);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.405951, 39.904111, 15000000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
};
