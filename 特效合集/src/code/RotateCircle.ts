const Cesium = window.Cesium;
import circle_rotateImg from '/static/circle_rotate.png';
const RotateCircle = () => {
  let x = 117.141411;
  let y = 36.19;
  // 旋转圆
  let circleRotate = window.viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(x, y),
    id: 'circleRotateTest',
    ellipse: {
      semiMinorAxis: 1000.0,
      semiMajorAxis: 1000.0,
      material: new Cesium.ImageMaterialProperty({
        image: circle_rotateImg
      })
    }
  });
  viewer.zoomTo(circleRotate);
  rotateMaterial(circleRotate.ellipse, 0, 1);
  /**
   * @description: 旋转材质
   * @param {*} instance ：实体
   * @param {*} _stRotation : 初始材质旋转角度
   * @param {*} _amount ：旋转角度变化量
   * @return {*}
   */

  function rotateMaterial(instance, _stRotation, _amount) {
    instance.stRotation = new Cesium.CallbackProperty(function () {
      _stRotation += _amount;
      if (_stRotation >= 360 || _stRotation <= -360) {
        _stRotation = 0;
      }
      return Cesium.Math.toRadians(_stRotation);
    }, false);
  }
};
export default RotateCircle;
