const Cesium = window.Cesium;
export default () => {
  let points;
  // 假设以下变量是根据用户界面交互来控制的
  let clippingPlanesEnabled = true; // 控制是否启用剪切平面
  let edgeStylingEnabled = true; // 控制是否启用边缘样式
  const globe = window.Viewer.scene.globe;
  let viewer = window.viewer;
  // 创建剪切平面的坐标点
  points = [
    new Cesium.Cartesian3(-1182592.8630924462, 5515580.9806405855, 2966674.365247578),
    new Cesium.Cartesian3(-1183337.777477057, 5515825.617716778, 2965927.4345367434),
    new Cesium.Cartesian3(-1184508.4932830015, 5515571.328839522, 2965932.974956288),
    new Cesium.Cartesian3(-1185587.0332886775, 5514889.448799464, 2966764.2948399023),
    new Cesium.Cartesian3(-1185099.0292063756, 5514576.687407264, 2967535.347584739),
    new Cesium.Cartesian3(-1182840.9384216308, 5515224.64431188, 2967234.1119776894)
  ];
  const pointsLength = points.length;
  const clippingPlanes = [];
  for (let i = 0; i < pointsLength; ++i) {
    const nextIndex = (i + 1) % pointsLength;
    let midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
    midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

    const up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
    let right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
    right = Cesium.Cartesian3.normalize(right, right);

    let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
    normal = Cesium.Cartesian3.normalize(normal, normal);

    const originCenteredPlane = new Cesium.Plane(normal, 0.0);
    const distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);

    clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
  }

  globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: clippingPlanes,
    edgeWidth: edgeStylingEnabled ? 1.0 : 0.0,
    edgeColor: Cesium.Color.WHITE,
    enabled: clippingPlanesEnabled
  });
  globe.backFaceCulling = true;
  globe.showSkirts = true;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(102.10153696529146, 27.899574509614247, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
};
