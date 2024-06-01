const Cesium = window.Cesium;
import radarImg from '/static/radar.png';
const AddTiandituWmts = () => {
  let x = 117.141411;
  let y = 36.19;
  let z = 0;
  let rader = window.viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(x, y),
    name: '图片雷达',
    id: 'pictureRadar',
    ellipse: {
      semiMajorAxis: 1000.0,
      semiMinorAxis: 1000.0,
      material: new Cesium.ImageMaterialProperty({
        image: radarImg,
        color: new Cesium.Color(1.0, 1.0, 0.0, 0.7)
      }),
      // 不设置高度则无法渲染外框线
      height: 20.0,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      outline: true,
      outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
    }
  });
  viewer.zoomTo(rader);
  rotateMaterial(rader.ellipse, 0, -3);

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
export default AddTiandituWmts;
