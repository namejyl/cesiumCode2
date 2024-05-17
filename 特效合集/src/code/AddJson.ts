const Cesium = window.Cesium;
const AddJson = () => {
  var viewer = window.Viewer;
  viewer.dataSources.add(Cesium.GeoJsonDataSource.load('/static/quanguo.json'));
};
export default AddJson;
