viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(117.118611, 36.193258, 15000.0), // 设置位置
  orientation: {
    heading: Cesium.Math.toRadians(20.0),
    pitch: Cesium.Math.toRadians(-90.0),
    roll: 0
  },
  duration: 5
});
// ------------------------------------------------------------------------------------------------------------
// 1，飞行(fly): 使相机飞向某个指定的位置。这通常是一个平滑的过渡，不仅仅是简单的位置变换。
view.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.435314, 39.960521, 15000.0), // 设置位置
  orientation: {
    heading: Cesium.Math.toRadians(20.0), // 方向
    pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
    roll: 0
  },
  duration: 5, // 设置飞行持续时间，默认会根据距离来计算
  complete: function () {
    //TODO
  }, // 到达位置后执行的回调函数
  cancle: function () {
    //TODO
  }, // 如果取消飞行则会调用此函数
  pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
  maximumHeight: 5000, // 相机最大飞行高度
  flyOverLongitude: 100 // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度(这个，很好用)});
});

// 2，缩放(zoom): 使相机向前或向后移动，从而使视野放大或缩小。
// 缩小
viewer.camera.zoomOut(500); // 向后移动500米
// 放大
viewer.camera.zoomIn(500); // 向前移动500米

// 3，移动(move): 沿着地平面或其他方向移动相机，而不改变它的高度或朝向。
// 向右移动
viewer.camera.moveRight(500); // 地面上向右移动500米

// 4，视角(look): 改变相机的朝向，但不改变其位置。通常用于围绕某个点旋转。
viewer.camera.look(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(-10)); // 向下看10度

// 5，平面扭转(twist): 改变相机的roll值，使相机绕其前进方向轴旋转。
viewer.camera.twistRight(Cesium.Math.toRadians(10)); // 顺时针扭转10度

// 6，3D旋转(rotate): 在三维空间中旋转相机，可以是任意方向的旋转。
viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(10)); // 绕Z轴旋转10度

// 7，用于将相机视角锁定到目标位置(lookAt): 设置相机的位置和朝向，以使其始终面向某个特定的点或对象。
var targetPosition = Cesium.Cartesian3.fromDegrees(103.851959, 1.29027);
viewer.camera.lookAt(targetPosition, new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 1500.0));

// 8，将地球或场景缩放到该实体的视图范围内(viewer.zoomTo()): 调整相机的位置和朝向，以最佳地查看某个特定的实体或对象
var entity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(103.851959, 1.29027),
  box: {
    dimensions: new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
    material: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.RED
  }
});
viewer.zoomTo(entity);
