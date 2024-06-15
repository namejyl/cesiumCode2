const Cesium = window.Cesium;
export default () => {
  var viewer = window.Viewer;
  viewer.dataSources.add(Cesium.CzmlDataSource.load('/static/卫星轨迹.czml')).then(function (dataSource: any) {});
};
