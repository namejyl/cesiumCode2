const Cesium = window.Cesium;
const AddTiandituWmts = () => {
  let options = {
    position: [117.141411, 36.19],
    radius: 1000.0,
    color: new Cesium.Color(1.0, 1.0, 0.0, 0.3),
    speed: 2.0
  };
  window.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.141411, 36.19, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
  var viewer = window.viewer;
  window.viewer = viewer;
  // 半径
  let _radius = options.radius;
  // 扫描扇形颜色
  let _color = options.color;
  // 扫描速度
  let _speed = options.speed;
  // 中心点坐标经纬度
  let _cenLon = options.position[0];
  let _cenLat = options.position[1];

  // 先建立椭球体
  window.viewer.entities.add({
    position: new Cesium.Cartesian3.fromDegrees(_cenLon, _cenLat),
    name: '立体雷达扫描',
    id: 'stereoRadarScanning',
    ellipsoid: {
      radii: new Cesium.Cartesian3(_radius, _radius, _radius),
      material: _color,
      outline: true,
      outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
      outlineWidth: 1
    }
  });

  let heading = 0;
  let positionArr: any = [];
  // 每一帧刷新时调用
  window.viewer.clock.onTick.addEventListener(() => {
    heading += _speed;
    positionArr = calculatePane(_cenLon, _cenLat, 1000.0, heading);
  });

  // 创建1/4圆形立体墙
  let radarWall = window.viewer.entities.add({
    wall: {
      positions: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegreesArrayHeights(positionArr);
      }, false),
      material: _color
    }
  });

  // 计算平面扫描范围
  function calculatePane(x1: any, y1: any, radius: any, heading: any) {
    var m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1));
    var rx = radius * Math.cos((heading * Math.PI) / 180.0);
    var ry = radius * Math.sin((heading * Math.PI) / 180.0);
    var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    var d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3());
    var c = Cesium.Cartographic.fromCartesian(d);
    var x2 = Cesium.Math.toDegrees(c.longitude);
    var y2 = Cesium.Math.toDegrees(c.latitude);
    return calculateSector(x1, y1, x2, y2);
  }

  // 计算竖直扇形
  function calculateSector(x1: any, y1: any, x2: any, y2: any) {
    let positionArr = [];
    positionArr.push(x1);
    positionArr.push(y1);
    positionArr.push(0);
    var radius = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(x1, y1), Cesium.Cartesian3.fromDegrees(x2, y2));
    // 扇形是1/4圆，因此角度设置为0-90
    for (let i = 0; i <= 90; i++) {
      let h = radius * Math.sin((i * Math.PI) / 180.0);
      let r = Math.cos((i * Math.PI) / 180.0);
      let x = (x2 - x1) * r + x1;
      let y = (y2 - y1) * r + y1;
      positionArr.push(x);
      positionArr.push(y);
      positionArr.push(h);
    }
    return positionArr;
  }
};
export default AddTiandituWmts;
