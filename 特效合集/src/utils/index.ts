const Cesium = window.Cesium;
class SettingCesium {
  Cesium: any;
  constructor(Cesium: any) {
    this.Cesium = Cesium;
  }
  // 添加高德矢量图
  addGdslt(Viewer: any) {
    let atLayer = new this.Cesium.UrlTemplateImageryProvider({
      url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      minimumLevel: 3,
      maximumLevel: 18
    });
    Viewer.imageryLayers.addImageryProvider(atLayer);
  }
  // 添加高德影像图
  addGdyxt(Viewer: any) {
    let atLayer = new Cesium.UrlTemplateImageryProvider({
      url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      minimumLevel: 3,
      maximumLevel: 18
    });
    Viewer.imageryLayers.addImageryProvider(atLayer);
  }
  // 添加高德路网中文注记图
  addGdlw(Viewer: any) {
    let atLayer = new this.Cesium.UrlTemplateImageryProvider({
      url: 'http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
      minimumLevel: 3,
      maximumLevel: 18
    });
    Viewer.imageryLayers.addImageryProvider(atLayer);
  }
  // 添加地形数据
  addTxsj(Viewer: any) {
    Viewer.terrainProvider = Cesium.createWorldTerrain();
  }
  // 添加局部地形
  addJbdx(Viewer: any) {
    // 地形对象
    let terrainProvider = new Cesium.CesiumTerrainProvider({
      url: '/terrain'
    });
    // 添加
    Viewer.scene.terrainProvider = terrainProvider;
  }
  // 地形夸张
  setDxkz(Viewer: any) {
    // 添加地形
    Viewer.terrainProvider = Cesium.createWorldTerrain();
    // 地形夸张
    Viewer.scene.globe.terrainExaggeration = 8.0;
  }
  // 添加瓦片坐标信息
  addWpzb(Viewer: any) {
    Viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider());
  }
  // 获取当前地图瓦片级别
  getWpsfjb(Viewer: any) {
    let tiles = new Set();
    let tilesToRender = Viewer.scene.globe._surface._tilesToRender;
    if (Cesium.defined(tilesToRender)) {
      for (let i = 0; i < tilesToRender.length; i++) {
        tiles.add(tilesToRender[i].level);
      }
      console.log('当前地图瓦片级别为:');
      console.log(tiles);
    }
  }
  // 获取当前地图中心的经纬度
  getDtzx(Viewer: any) {
    let centerResult = Viewer.camera.pickEllipsoid(new Cesium.Cartesian2(Viewer.canvas.clientWidth / 2, Viewer.canvas.clientHeight / 2));
    let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerResult);
    let curLongitude = (curPosition.longitude * 180) / Math.PI;
    let curLatitude = (curPosition.latitude * 180) / Math.PI;
    return {
      lon: curLongitude,
      lat: curLatitude
    };
  }
  //坐标拾取
  getZbsq(Viewer: any) {
    // 注册屏幕点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(Viewer.scene.canvas);
    handler.setInputAction(function (event: any) {
      // 转换为不包含地形的笛卡尔坐标
      let clickPosition = Viewer.scene.camera.pickEllipsoid(event.position);
      // 转经纬度（弧度）坐标
      let radiansPos = Cesium.Cartographic.fromCartesian(clickPosition);
      // 转角度
      console.log('经度：' + Cesium.Math.toDegrees(radiansPos.longitude) + ', 纬度：' + Cesium.Math.toDegrees(radiansPos.latitude));
      // 添加点
      Viewer.entities.add({
        position: clickPosition,
        point: {
          color: Cesium.Color.YELLOW,
          pixelSize: 30
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  //获取当前可视矩形范围
  getKsfw(Viewer: any) {
    let rectangle = Viewer.camera.computeViewRectangle();
    console.log('当前可视范围矩形为：');
    console.log(rectangle);
  }
  // 加载3d模型
  set3dModel(Viewer: any) {
    Viewer.entities.removeAll();
    const position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    const entity = Viewer.entities.add({
      name: '/public/glb/Cesium_Air.glb',
      position: position,
      orientation: orientation,
      model: {
        uri: '/public/glb/Cesium_Air.glb',
        minimumPixelSize: 128,
        maximumScale: 20000
      }
    });
    Viewer.trackedEntity = entity;
  }
  // 3d模型运动
  set3dModelExercise(Viewer: any) {
    // 假设你已经有了Cesium.Viewer实例叫做viewer

    // 创建一个模型实体
    var entity = Viewer.entities.add({
      // 模型位置
      position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
      model: {
        uri: '/public/glb/Cesium_Air.glb', // 3D模型的路径
        minimumPixelSize: 128,
        maximumScale: 20000
      }
    });

    // 创建一个轨迹，模型将沿着这个轨迹移动
    var property = new Cesium.SampledPositionProperty();
    property.addSample(Cesium.JulianDate.fromIso8601('2021-01-01T00:00:00Z'), Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883));
    property.addSample(Cesium.JulianDate.fromIso8601('2021-01-02T00:00:00Z'), Cesium.Cartesian3.fromDegrees(-122.417, 37.775)); // 从纽约飞往洛杉矶

    // 将模型的位置属性与轨迹关联
    entity.position = property;

    // 开始动画
    Viewer.clock.shouldAnimate = true;
    // 设置视角跟随物体运动，并显示信息框
    Viewer.trackedEntity = entity;
  }
}

export default new SettingCesium(window.Cesium);
