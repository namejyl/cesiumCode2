const Cesium = window.Cesium;
//   contextOptions: {
//     webgl: {
//       alpha: true;
//     }
//   }
//   viewer.scene.skyBox.show = false; //去掉天空盒子
//   viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0); //设置场景背景色透明，便于显示自定的背景
//   #cesiumContainer {
//     background: url('https://t11.baidu.com/it/u=1152680588,219410869&fm=30&app=106&f=JPEG?w=640&h=458&s=F93A7EDBC4E64D1563A5E31A03006057') no-repeat;
//   }
const SetBackground = () => {
  let viewer = window.Viewer;
  viewer.scene.skyBox.show = false; //去掉天空盒子
  viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0); //设置场景背景色透明，便于显示自定的背景
};
export default SetBackground;
