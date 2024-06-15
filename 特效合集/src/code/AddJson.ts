const Cesium = window.Cesium;
export default () => {
  var viewer = window.Viewer;
  viewer.dataSources.add(Cesium.GeoJsonDataSource.load('/static/quanguo.json'));
};
