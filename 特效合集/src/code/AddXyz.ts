const Cesium = window.Cesium;
const AddTiandituWmts = () => {
  let viewer = window.Viewer;
  // var osmProvider = new Cesium.UrlTemplateImageryProvider({
  //   url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  // });
  // viewer.imageryLayers.addImageryProvider(osmProvider);
  var imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
    url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
  });
  viewer.imageryLayers.addImageryProvider(imageryProvider);
};
export default AddTiandituWmts;
