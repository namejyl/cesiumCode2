const Cesium = window.Cesium;
export default () => {
  let viewer = window.Viewer;
  let entityData = {
    name: '旋转椭圆',
    type: 'ellipse',
    id: 'ellipseRotateTest',
    position: '117.118611,36.193258',
    semiMinorAxis: 500.0,
    semiMajorAxis: 1000.0,
    material: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
    num: 1,
    rotate: true,
    rotateSpeed: 1
  };
  // 旋转椭圆
  let ellipseRotate = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(117.118611, 36.193258),
    id: 'ellipseRotateTest',
    data: entityData,
    ellipse: {
      semiMinorAxis: 500.0,
      semiMajorAxis: 1000.0,
      material: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
    },
    description:
      '<div style="">' +
      '<table style="width:100%;text-align:center;overflow:auto;background-color: white;" border="5"><tbody>' +
      '<tr><td style="color:#131722;border:solid ">名称</td><td style="color:#131722;border:solid ">' +
      entityData.name +
      '</td></tr>' +
      '<tr><td style="color:#131722;border:solid ">类型</td><td style="color:#131722;border:solid ">' +
      entityData.type +
      '</td></tr>' +
      '<tr><td style="color:#131722;border:solid ">编号</td><td style="color:#131722;border:solid ">' +
      entityData.id +
      '</td></tr>' +
      '<tr><td style="color:#131722;border:solid ">经纬度</td><td style="color:#131722;border:solid ">' +
      entityData.position +
      '</td></tr>' +
      '</tbody></table></div>'
  });
  viewer.zoomTo(ellipseRotate);
  RotateEntityFn(ellipseRotate.ellipse, 0, 1);
};

function RotateEntityFn(instance: any, _rotation: any, _amount: any) {
  instance.rotation = new Cesium.CallbackProperty(function () {
    _rotation += _amount;
    return Cesium.Math.toRadians(_rotation);
  }, false);
}
