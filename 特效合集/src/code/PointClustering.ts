const Cesium = window.Cesium;
import poiImg from '/static/GreenPin1LargeB.png';
const PointClustering = () => {
  let pointArray = [];
  for (let i = 0; i < 2000; i++) {
    let x = 117.102442 + Math.random() * 0.1;
    let y = 36.185321 + Math.random() * 0.1;
    pointArray.push([x, y]);
  }

  /**
   * 点聚合
   * @param {Array} pointArray 点位数组
   */
  var viewer = window.viewer;
  //聚合属性只对label标签，point点和广告牌billboard生效
  const dataSource = new Cesium.CustomDataSource('myData');
  // 添加数据源
  const pinBuilder = new Cesium.PinBuilder();
  const pin50 = pinBuilder.fromText('100+', Cesium.Color.RED, 72).toDataURL();
  const pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 56).toDataURL();
  const pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
  const pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 40).toDataURL();
  const pin10 = pinBuilder.fromText('3+', Cesium.Color.BLUE, 36).toDataURL();
  // 点
  for (let i = 0; i < pointArray.length; ++i) {
    dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(pointArray[i][0], pointArray[i][1], 1000),
      // point: {
      //     color: Cesium.Color.RED,
      // },
      label: {
        text: 'POI',
        font: 'bold 15px Microsoft YaHei',
        // 竖直对齐方式
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        // 水平对齐方式
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        // 偏移量
        pixelOffset: new Cesium.Cartesian2(15, 0)
      },
      billboard: {
        image: poiImg,
        width: 32,
        height: 32
      }
    });
  }
  const dataSourcePromise = viewer.dataSources.add(dataSource);
  dataSourcePromise.then(function (dataSource) {
    // 设置聚合参数
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = 60;
    dataSource.clustering.minimumClusterSize = 2;
    // 添加监听函数
    dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.id = cluster.label.id;
      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

      if (clusteredEntities.length >= 100) {
        cluster.billboard.image = pin50;
      } else if (clusteredEntities.length >= 40) {
        cluster.billboard.image = pin40;
      } else if (clusteredEntities.length >= 30) {
        cluster.billboard.image = pin30;
      } else if (clusteredEntities.length >= 20) {
        cluster.billboard.image = pin20;
      } else if (clusteredEntities.length >= 3) {
        cluster.billboard.image = pin10;
      } else {
        cluster.billboard.image = poiImg;
      }
    });
  });
  /**
   * @description: 将图片和文字合成新图标使用（参考Cesium源码）
   * @param {*} url：图片地址
   * @param {*} label：文字
   * @param {*} size：画布大小
   * @return {*} 返回canvas
   */
  function combineIconAndLabel(url, label, size) {
    // 创建画布对象
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext('2d');
    let promise = new Cesium.Resource.fetchImage(url).then(image => {
      // 异常判断
      try {
        ctx.drawImage(image, 0, 0);
      } catch (e) {
        console.log(e);
      }

      // 渲染字体
      // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
      ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
      ctx.font = 'bold 20px Microsoft YaHei';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, size / 2, size / 2);

      return canvas;
    });
    return promise;
  }
};
export default PointClustering;
