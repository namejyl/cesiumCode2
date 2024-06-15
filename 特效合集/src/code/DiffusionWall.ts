const Cesium = window.Cesium;
import axios from 'axios';
export default () => {
  axios.get('/static/geojson/财源街道边界.geojson').then(res => {
    let list = res.data.features[0].geometry.coordinates[0];
    DiffusionWallFn(list, 2.0, 1000.0, new Cesium.Color(1.0, 1.0, 0.0, 0.7));
  });
};
/**
 * 动态扩散墙效果
 * @param {Array} _positions 坐标数组
 * @param {Number} _scale    最大缩放比例
 * @param {Number} _height   高度
 * @param {Object} _material 材质
 */
function DiffusionWallFn(_positions, _scale, _height, _material) {
  let scale = 1;
  window.viewer.entities.add({
    name: '扩散墙',
    id: 'diffusionWall',
    wall: {
      positions: new Cesium.CallbackProperty(() => {
        // 判断是放大还是缩小
        // _scale：最大缩放比例
        if (_scale >= 1) {
          scale += _scale / 200.0;
          if (scale >= _scale) {
            scale = 1.0;
          }
        } else {
          scale -= _scale / 200.0;
          if (scale <= _scale) {
            scale = 1;
          }
        }
        let polygon = turf.polygon(_positions);
        let scaledPolygon = turf.transformScale(polygon, scale);
        let newPositions = [];
        // 遍历多边形
        for (let i = 0; i < scaledPolygon.geometry.coordinates[0].length; i++) {
          // 遍历节点
          scaledPolygon.geometry.coordinates[0][i].forEach(item => {
            newPositions.push(item);
          });
          // _height：墙高度
          newPositions.push(_height);
        }
        return Cesium.Cartesian3.fromDegreesArrayHeights(newPositions);
      }, false),
      // material：墙材质
      material: _material
    }
  });
}
