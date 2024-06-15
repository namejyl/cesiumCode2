const Cesium = window.Cesium;
export default () => {
  let viewer = window.viewer;
  // 获取场景对象
  let globe = viewer.scene.globe;
  // 等高线材质的uniforms
  let contourUniforms = {};
  // 使用等高线材质
  let material = Cesium.Material.fromType('ElevationContour');
  // 获取材质中的uniforms
  contourUniforms = material.uniforms;
  // 线宽2.0px
  contourUniforms.width = 2.0;
  // 高度间隔为150米
  contourUniforms.spacing = 150;
  // 等高线颜色为红色
  contourUniforms.color = Cesium.Color.RED;
  // 设置材质
  globe.material = material;
};
