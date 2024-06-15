const Cesium = window.Cesium;
export default () => {
  // 创建 Cesium 场景
  var viewer = window.viewer;

  // 第一个热力图
  var coordinate1 = [80.0, 10.0, 109, 29.0];
  var heatMap1 = createHeatMap(getData(1000).max, getData(1000).data);
  createRectangle(viewer, coordinate1, heatMap1);

  // 第二个热力图
  var coordinate2 = [80.0, 30.0, 109, 40.0];
  var heatMap2 = createHeatMap(getData(3000).max, getData(3000).data);
  createRectangle(viewer, coordinate2, heatMap2);

  // 第三个热力图
  var coordinate3 = [80.0, 41.0, 109.0, 50.0];
  var heatMap3 = createHeatMap(getData(5000).max, getData(5000).data);
  createRectangle(viewer, coordinate3, heatMap3);
  // 生成len个随机数据
  function getData(len) {
    //构建一些随机数据点
    var points = [];
    var max = 0;
    var width = 1000;
    var height = 1000;
    while (len--) {
      var val = Math.floor(Math.random() * 1000);
      max = Math.max(max, val);
      var point = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        value: val
      };
      points.push(point);
    }
    return { max: max, data: points };
  }

  // 创建正方形 绑定热力图
  function createRectangle(viewer, coordinate, heatMap) {
    let ew = viewer.entities.add({
      name: 'Rotating rectangle with rotating texture coordinate',
      show: true,
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(coordinate[0], coordinate[1], coordinate[2], coordinate[3]),
        material: heatMap._renderer.canvas // 核心语句，填充热力图
      }
    });
    viewer.zoomTo(ew);
  }
  // 创建热力图
  function createHeatMap(max, data) {
    // 创建元素
    var heatDoc = document.createElement('div');
    heatDoc.setAttribute('style', 'width:1000px;height:1000px;margin: 0px;display: none;');
    document.body.appendChild(heatDoc);
    // 创建热力图对象
    var heatmap = h337.create({
      container: heatDoc,
      radius: 20,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75,
      gradient: {
        '0.9': 'red',
        '0.8': 'orange',
        '0.7': 'yellow',
        '0.5': 'blue',
        '0.3': 'green'
      }
    });
    // 添加数据
    heatmap.setData({
      max: max,
      data: data
    });
    return heatmap;
  }
};
