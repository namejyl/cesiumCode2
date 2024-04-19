var GridImagery = new Cesium.GridImageryProvider();
var imageryLayers = window.viewer.imageryLayers;
var GridImageryLayer = imageryLayers.addImageryProvider(GridImagery); // 添加网格图层
imageryLayers.raiseToTop(GridImageryLayer); // 将网格图层置顶
this.layerList.push(GridImageryLayer);
