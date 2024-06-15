const Cesium = window.Cesium;
export default async () => {
  let viewer = window.Viewer;
  StartRotate(viewer, Cesium);
  setTimeout(async () => {
    StopRotate(viewer, Cesium);
  }, 10000);
};
function StartRotate(viewer: any, Cesium: any) {
  // 启动时钟动画
  viewer.clock.shouldAnimate = true;
  // 如果需要加快或减慢地球自转速度
  viewer.clock.multiplier = 100.0; // 1.0代表真实时间速率，大于1则加速，小于1则减速
  viewer.clockViewModel.shouldAnimate = true;
  var previousTime = viewer.clock.currentTime.secondsOfDay;
  const spinRate = 1; // 可以根据需要调整这个值来控制旋转速度
  const onTickCallback = () => {
    var currentTime = viewer.clock.currentTime.secondsOfDay;
    var delta = (currentTime - previousTime) / 1000; // 计算时间差
    previousTime = currentTime;
    // 旋转地球的相机，这里使用Cesium.Cartesian3.UNIT_Z作为旋转轴，以及根据时间差和旋转速度计算出的旋转角度
    viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  };
  // 监听时钟的tick事件，当每一帧渲染时触发回调
  viewer.clock.onTick.addEventListener(onTickCallback);
}
function StopRotate(viewer: any, Cesium: any) {
  // 启动时钟动画
  viewer.clock.shouldAnimate = false;
  // 如果需要加快或减慢地球自转速度
  viewer.clock.multiplier = 100.0; // 1.0代表真实时间速率，大于1则加速，小于1则减速
  viewer.clockViewModel.shouldAnimate = false;
  var previousTime = viewer.clock.currentTime.secondsOfDay;
  const spinRate = 1; // 可以根据需要调整这个值来控制旋转速度
  const onTickCallback = () => {
    var currentTime = viewer.clock.currentTime.secondsOfDay;
    var delta = (currentTime - previousTime) / 1000; // 计算时间差
    previousTime = currentTime;
    // 旋转地球的相机，这里使用Cesium.Cartesian3.UNIT_Z作为旋转轴，以及根据时间差和旋转速度计算出的旋转角度
    viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  };
  // 监听时钟的tick事件，当每一帧渲染时触发回调
  viewer.clock.onTick.removeEventListener(onTickCallback);
}
