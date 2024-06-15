const Cesium = window.Cesium;
import axios from 'axios';
export default () => {
  axios.get('/static/geojson/岱岳区水域.geojson').then(res => {
    let array = [];
    let list = res.data.features[200].geometry.coordinates[0][0];
    for (let i = 0; i < list.length; i++) {
      array.push(list[i][0]);
      array.push(list[i][1]);
    }
    DrawWallFn(array);
    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(117.233478, 36.309579, 15000.0), // 设置位置
      orientation: {
        heading: Cesium.Math.toRadians(20.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0
      },
      duration: 5
    });
  });
};

/**
 * 绘制墙
 * @param {Array} polygonArray 坐标数组
 */
function DrawWallFn(polygonArray: any) {
  const instances = [];
  const geometry = new Cesium.WallGeometry({
    positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
    // 设置高度
    maximumHeights: new Array(polygonArray.length / 2).fill(400),
    minimunHeights: new Array(polygonArray.length / 2).fill(0)
  });
  instances.push(
    new Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREEN)
      }
    })
  );

  // 合并单个geometry,提高渲染效率
  const primitive = new Cesium.Primitive({
    show: true, // 默认隐藏
    allowPicking: false,
    geometryInstances: instances,
    // PerInstanceColorAppearance：使用每个实例自定义的颜色着色
    appearance: new Cesium.PerInstanceColorAppearance()
  });
  window.viewer.scene.primitives.add(primitive);
}
