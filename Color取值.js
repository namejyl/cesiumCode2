var color = new Cesium.Color(1.0, 0.0, 0.0, 1.0); // 红色，最后一个值是透明度

var color = Cesium.Color.fromCssColorString('#FF0000'); // 红色

var color = Cesium.Color.fromCssColorString('rgba(255, 0, 0, 1)'); // 红色

var color = Cesium.Color.fromCssColorString('rgb(255, 0, 0)'); // 红色

var viewer = new Cesium.Viewer('cesiumContainer');
var entity = viewer.entities.add({
  name: 'Red polygon on surface',
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([-107.0, 40.0, -107.0, 35.0, -102.0, 35.0, -102.0, 40.0])),
    material: new Cesium.Color.fromCssColorString('red').withAlpha(0.5) // 半透明红色
  }
});
