const Cesium = window.Cesium;
import axios from 'axios';
//地图反选遮罩（地图掩模）
export default () => {
  let viewer = window.Viewer;
  let areaJson: any = null;
  axios
    .get('/static/Taishan_District.json')
    .then(res => {
      areaJson = res.data.features[0].geometry.coordinates[0][0];
    })
    .then(() => {
      // 获取区域的经纬度坐标
      let positionArray = [];
      for (let i = 0; i < areaJson.length; i++) {
        positionArray.push(areaJson[i][0]);
        positionArray.push(areaJson[i][1]);
      }
      // 遮罩
      let polygonEntity = new Cesium.Entity({
        id: 'mask_polygon',
        polygon: {
          hierarchy: {
            // 添加外部区域为1/4半圆，设置为180会报错
            positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 90, 179, 90, 179, 0]),
            // 中心挖空的“洞”
            holes: [
              {
                positions: Cesium.Cartesian3.fromDegreesArray(positionArray)
              }
            ]
          },
          // 设置贴地
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          material: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
          // material: new Cesium.Color(15 / 255.0, 38 / 255.0, 84 / 255.0, 0.7)
        }
      });

      // 边界线
      let lineEntity = new Cesium.Entity({
        id: 'mask_line',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positionArray),
          width: 5,
          // 设置贴地
          clampToGround: true,
          material: Cesium.Color.YELLOW
        }
      });

      viewer.entities.add(polygonEntity);
      viewer.entities.add(lineEntity);
      viewer.flyTo(lineEntity);
    });
};
