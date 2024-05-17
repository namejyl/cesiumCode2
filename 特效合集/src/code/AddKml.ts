const Cesium = window.Cesium;
const AddKml = () => {
  // ---
  var viewer = window.Viewer;
  viewer.dataSources.add(Cesium.KmlDataSource.load('/static/山东省边界.kml')).then(function (dataSource: any) {});
};
export default AddKml;
