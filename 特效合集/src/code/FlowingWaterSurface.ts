const Cesium = window.Cesium;
import waterNormalsImg from '/static/waterNormals.png';
import axios from 'axios';
const FlowingWaterSurface = () => {
  // ---
  // 获取水域数据（黄前水库）
  let waterData: any = [];
  axios
    .get('/static/geojson/岱岳区水域.geojson')
    .then(res => {
      let list = res.data.features[200].geometry.coordinates[0][0];
      for (let i = 0; i < list.length; i++) {
        waterData.push(list[i][0]);
        waterData.push(list[i][1]);
      }
    })
    .then(() => {
      FlowingWaterSurfaceFn(waterData);
    });
};
export default FlowingWaterSurface;

/**
 * 动态流动水面
 * @param {Array} data 多边形坐标
 */
function FlowingWaterSurfaceFn(data) {
  var viewer = window.viewer;
  // 流动水面效果
  let waterPrimitive = new Cesium.GroundPrimitive({
    show: true, // 默认隐藏
    allowPicking: false,
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        id: 'water',
        polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(data)),
        extrudedHeight: 0,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: new Cesium.Material({
        fabric: {
          type: 'Water',
          uniforms: {
            // 水的基本颜色
            baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
            // 水的法线贴图
            normalMap: waterNormalsImg,
            // 水波纹的数量
            frequency: 1000.0,
            // 水的流速
            animationSpeed: 0.05,
            // 水波纹振幅
            amplitude: 10,
            // 镜面反射强度
            specularIntensity: 10
          }
        }
      })
    })
  });
  viewer.zoomTo(waterPrimitive);

  viewer.scene.groundPrimitives.add(waterPrimitive);
}
