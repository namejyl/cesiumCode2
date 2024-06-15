const Cesium = window.Cesium;
export default () => {
  var viewer = window.Viewer;
  // 启用光照
  viewer.scene.globe.enableLighting = true;
  viewer.shadows = true;
  viewer.clock.shouldAnimate = true;
  viewer.clock.multiplier = 5000;
};
