const Cesium = window.Cesium;
const InduationAnalysis = () => {
  /**
   * 空间分析-淹没分析
   * @param {Array} positions 位置数组
   * @param {Number} waterHeight 当前水位高度
   * @param {Number} targertWaterHeight 目标水位高度
   * @param {Number} speed 水位上升速度
   */
  let positions = [117.199818, 36.348001, 117.199818, 36.206481, 116.976176, 36.206481, 116.976176, 36.348001];
  let waterHeight = 0;
  let targertWaterHeight = 500;
  let speed = 0.2;
  speed = (speed * (targertWaterHeight - waterHeight)) / 1000;
  var viewer = window.viewer;
  let entity = viewer.entities.add({
    id: 'induationAnalysis',
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
      perPositionHeight: true,
      // 使用回调函数Callback，直接设置extrudedHeight会导致闪烁
      extrudedHeight: new Cesium.CallbackProperty(function () {
        waterHeight += speed;
        if (waterHeight > targertWaterHeight) {
          waterHeight = targertWaterHeight;
        }
        return waterHeight;
      }, false),
      material: new Cesium.Color.fromBytes(64, 157, 253, 150)
    }
  });
  viewer.zoomTo(entity);
};
export default InduationAnalysis;
