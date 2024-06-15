const Cesium = window.Cesium;
import billbordImg from '/static/BluePin1LargeB.png';
export default () => {
  let lon = 117.102442;
  let lat = 36.185321;
  let name = '泰山火车站';
  let color = 'blue';
  var viewer = window.viewer;
  viewer.entities.add({
    name: name,
    id: 'billboard',
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
    // 图标
    billboard: {
      image: billbordImg,
      width: 50,
      height: 50
    },
    label: {
      //文字标签
      text: name,
      font: '20px sans-serif',
      style: Cesium.LabelStyle.FILL,
      // 对齐方式(水平和竖直)
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(20, -2),
      showBackground: true,
      backgroundColor: new Cesium.Color.fromBytes(0, 70, 24)
    }
  });

  // 先画线后画点，防止线压盖点
  let linePositions = [];
  linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 5));
  linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 1000));
  viewer.entities.add({
    polyline: {
      positions: linePositions,
      width: 1.5,
      material: color
    }
  });

  // 画点
  let entity = viewer.entities.add({
    id: 'billboard_point',
    // 给初始点位设置一定的离地高度，否者会被压盖
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 5),
    point: {
      color: color,
      pixelSize: 15
    }
  });
  viewer.zoomTo(entity);
};
