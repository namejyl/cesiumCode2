const Cesium = window.Cesium;
// 天空盒背景图必须是 正方形！！！
const CustomSkyBox = () => {
  var viewer = window.Viewer;
  viewer.scene.skyBox = new Cesium.SkyBox({
    sources: {
      negativeX: '/static/map.png',
      negativeY: '/static/map.png',
      negativeZ: '/static/map.png',
      positiveX: '/static/map.png',
      positiveY: '/static/map.png',
      positiveZ: '/static/map.png'
    }
  });
};
export default CustomSkyBox;
