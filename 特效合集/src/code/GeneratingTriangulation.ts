const Cesium = window.Cesium;
export default () => {
  //根据地形和矩形区域生成三角网
  // num:三角网横向和纵向的点数（值越大，越详细，加载越慢）
  // h:三角网面提升的高度
  let num = 30,
    h = 100;
  let viewer = window.viewer;
  // 1. 创建一个矩形区域
  var rectangle = Cesium.Rectangle.fromDegrees(117.09649937089316, 36.20673458245797, 117.11797117691083, 36.230040948473906);
  // 2. 在这个矩形区域内生成点集
  var width = num; // 横向点数
  var height = num; // 纵向点数
  var terrainProvider = viewer.terrainProvider;
  var positions = [];
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var longitude = Cesium.Math.lerp(rectangle.west, rectangle.east, x / (width - 1));
      var latitude = Cesium.Math.lerp(rectangle.south, rectangle.north, y / (height - 1));
      positions.push(Cesium.Cartographic.fromRadians(longitude, latitude));
    }
  }
  // 3. 获取点集的高程信息
  Cesium.sampleTerrainMostDetailed(terrainProvider, positions).then(function (samples) {
    var points = samples.map(function (sample) {
      return turf.point([Cesium.Math.toDegrees(sample.longitude), Cesium.Math.toDegrees(sample.latitude), sample.height], { z: sample.height }); // 将高度值保存到名为 'z' 的属性中);
    });
    // 创建一个FeatureCollection
    var featureCollection = turf.featureCollection(points);
    var tin = turf.tin(featureCollection, 'z');
    var geometryInstances = []; // 用于存放所有的三角形GeometryInstance
    var instances = [];
    // 遍历每个TIN三角形
    tin.features.forEach(function (feature, i) {
      var coordinates = feature.geometry.coordinates[0];
      var heights = [feature.properties.a, feature.properties.b, feature.properties.c];
      // 将三角形的三个顶点转换为笛卡尔坐标
      var positions = coordinates.map(function (coord, index) {
        return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], heights[index] + h);
      });
      const point1 = positions[0];
      const point2 = positions[1];
      const point3 = positions[2];
      //使用我们新定义的函数计算每个三角形的坡度
      var analysisResult = calculateSlopeAndAspect(point1, point2, point3);
      var slope = analysisResult.slope;
      var hue = slope / 90.0; // 将坡度从0到90度映射到色调从0到1
      var saturation = 1.0; // 全饱和度
      var lightness = 0.5; // 正常亮度
      var alpha = 1.0; // 完全不透明
      //将HSL颜色转换为RGBA，当坡度为0度时，hue变为0，颜色是红色；当坡度为90度时，hue变为1，颜色是绿色；在0到90度之间的坡度将映射到从红色到绿色之间的颜色。
      var color = Cesium.Color.fromHsl(hue, saturation, lightness).withAlpha(alpha);

      //添加三角面
      viewer.entities.add({
        name: '三角面',
        id: 'triangle' + i,
        polygon: {
          hierarchy: [positions[0], positions[1], positions[2]],
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          perPositionHeight: true,
          // material: Cesium.Color.fromCssColorString("#23B8BA").withAlpha(
          //   1.0
          // ),
          material: color,
          //  extrudedHeight: 0,
          outline: true,
          outlineColor: Cesium.Color.GREEN
        }
      });
      // 添加三角形的三个顶点
      var topPositions = coordinates.map(function (coord, index) {
        return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], heights[index] + h - 200);
      });
      // 添加顶面
      let ew = viewer.entities.add({
        name: '顶面',
        id: '顶面' + i,
        polygon: {
          hierarchy: [topPositions[0], topPositions[1], topPositions[2]],
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          perPositionHeight: true,
          material: Cesium.Color.YELLOW.withAlpha(1),
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.5)
        }
      });
      viewer.zoomTo(ew);
      // 设置底部高度
      var baseHeight = 500;
      // 底部三角形的三个顶点（X,Y坐标与顶部三角形相同，但高度为固定值）
      const bottomPositions = coordinates.map(function (coord) {
        return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], baseHeight);
      });

      // 添加三个侧面
      for (var j = 0; j < topPositions.length - 1; j++) {
        const next = (j + 1) % 3; // 确保最后一个顶点与第一个顶点连接
        console.log(positions[j]);
        // 当前侧面的四个顶点
        const sidePositions = [topPositions[j], topPositions[next], bottomPositions[next], bottomPositions[j]];

        viewer.entities.add({
          name: '侧面' + j,
          id: 'sideWall' + i + '_' + j,
          polygon: {
            hierarchy: sidePositions,
            perPositionHeight: true,
            material: Cesium.Color.YELLOW.withAlpha(1),
            outline: true,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.5)
          }
        });
      }
      // 添加底部三角形
      viewer.entities.add({
        name: '底面',
        id: 'bottomFace' + i,
        polygon: {
          hierarchy: bottomPositions,
          perPositionHeight: true,
          material: Cesium.Color.YELLOW.withAlpha(1),
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.5)
        }
      });
    });

    // 生成点
    var cartesianPoints = points.map(function (point) {
      var coord = point.geometry.coordinates;
      var cartographic = Cesium.Cartographic.fromDegrees(coord[0], coord[1], coord[2]);
      return Cesium.Cartographic.toCartesian(cartographic);
    });
    var pointCollection = new Cesium.PointPrimitiveCollection();

    cartesianPoints.forEach(function (position) {
      pointCollection.add({
        position: position,
        color: Cesium.Color.RED,
        pixelSize: 5
      });
    });
    console.log(1);
    viewer.scene.primitives.add(pointCollection);
  });
};
/**
 * 计算三角形的坡度
 * @param {*} point1
 * @param {*} point2
 * @param {*} point3
 * @returns
 */
function calculateSlopeAndAspect(point1, point2, point3) {
  // 计算两个向量，它们位于三角形的两边
  var v1 = Cesium.Cartesian3.subtract(point1, point2, new Cesium.Cartesian3());
  var v2 = Cesium.Cartesian3.subtract(point2, point3, new Cesium.Cartesian3());
  // 计算这两个向量的叉积，得到三角形的法向量
  var normal = new Cesium.Cartesian3();
  Cesium.Cartesian3.cross(v1, v2, normal);
  Cesium.Cartesian3.normalize(normal, normal);
  // 计算坡度：法向量和垂直向量（0,0,1）之间的夹角
  var up = new Cesium.Cartesian3(0, 0, 1);
  var slopeRadians = Math.acos(Cesium.Cartesian3.dot(normal, up));
  var slopeDegrees = Cesium.Math.toDegrees(slopeRadians);
  // 如果坡度大于90度，则将其减少到90度以下
  if (slopeDegrees > 90) {
    slopeDegrees = 180 - slopeDegrees;
  }
  // 返回坡度值
  return { slope: slopeDegrees };
}
