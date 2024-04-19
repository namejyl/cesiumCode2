/**
 * 底图切换
 */
const baseMapSwitchFn = async type => {
  // 假设新底图图层的URL和Credit是已知的
  var newImageryProvider1 = new Cesium.UrlTemplateImageryProvider({
    url: '/zxy/{z}/{x}/{y}.jpg'
  });
  var newImageryProvider2 = new Cesium.UrlTemplateImageryProvider({
    url: '/xyz1/{z}/{x}/{y}.png'
  });
  var currentImageryLayer = window.viewer.imageryLayers.get(0);
  if (type == '1') {
    // 将新的瓦片数据源添加到Viewer中，并移除旧的
    window.viewer.imageryLayers.addImageryProvider(newImageryProvider1);
    window.viewer.imageryLayers.remove(currentImageryLayer);
  } else if (type == '2') {
    // 将新的瓦片数据源添加到Viewer中，并移除旧的
    window.viewer.imageryLayers.addImageryProvider(newImageryProvider2);
    window.viewer.imageryLayers.remove(currentImageryLayer);
  }
};
