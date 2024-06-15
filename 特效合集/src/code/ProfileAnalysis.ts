const Cesium = window.Cesium;
export default () => {
  // 引入类文件
  // 实例化，参数分别为cesium的viewer对象和渲染图表的容器dom
  const profile = new ProfileAnalysis(viewer);
  // 开始剖面分析
  profile.start();
  // 销毁剖面图
  //   profile.disposeChart();
  // 结束剖面分析
  //   profile.stop();
};

class ProfileAnalysis {
  private viewer: Viewer;

  /** 场景操作 */
  private handler: Cesium.ScreenSpaceEventHandler;

  /** 用于加载图表的HTMLElement */
  private echartRef: any;

  /** 点的可渲染集合 */
  private pointCollection: Cesium.PointPrimitiveCollection;

  /** 贴地几何 */
  private groundPrimitive: GroundPrimitive[] | null = [];

  constructor(viewer: Viewer, echartRef: any) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.echartRef = echartRef;
    this.pointCollection = new Cesium.PointPrimitiveCollection();
    this.viewer.scene.primitives.add(this.pointCollection);
  }

  /** 取点 */
  private positions: Cartesian3[] = [];

  /**
   * @name: start
   * @Date: 2022-09-27 17:34:15
   * @description: 开始剖面分析
   */
  public start() {
    this.handler.setInputAction(click => {
      const ray = this.viewer.camera.getPickRay(click.position);
      const cartesian = this.viewer.scene.globe.pick(ray!, this.viewer.scene);
      console.log('取点', cartesian);
      this.pointCollection.add({
        position: cartesian,
        color: Cesium.Color.YELLOW,
        pixelSize: 10
      });
      this.positions.push(cartesian!);
      const length = this.positions.length;
      if (length >= 2) {
        // 绘制贴地线
        let lineInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.CorridorGeometry({
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
            positions: [this.positions[length - 1], this.positions[length - 2]],
            width: 10
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5))
          }
        });
        let groundPrimitive = new Cesium.GroundPrimitive({
          geometryInstances: lineInstance,
          classificationType: Cesium.ClassificationType.TERRAIN
        });
        this.groundPrimitive?.push(groundPrimitive);
        this.viewer.scene.primitives.add(groundPrimitive);
        // 插值运算
        this.interPoints(this.positions);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * @name: stop
   * @Date: 2022-09-28 09:54:08
   * @description: 结束剖面分析
   */
  public stop() {
    // 清除鼠标左键单击事件
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 清除剖面图
    this.disposeChart();
    // 清除取点
    this.positions = [];
    // 清除插值点
    this.interData = [];
    // 清除绘制的点和线
    // this.viewer.scene.primitives.remove(this.groundPrimitive);
    for (let i = 0; i < this.groundPrimitive!.length; i++) {
      this.viewer.scene.primitives.remove(this.groundPrimitive![i]);
    }
    this.viewer.scene.primitives.remove(this.pointCollection);
  }

  /** 插值点 */
  private interData: [number, number][] = [];

  /**
   * @name: interPoints
   * @Date: 2022-09-27 17:24:02
   * @description: 坐标点插值positionsDegrees
   * @param {any} positions 坐标点数组
   * @param {number} interNumber 取样点个数
   */
  private async interPoints(positions: any, interNumber: number = 10) {
    const posDegrees = [];
    for (let index = 0; index < positions.length; index++) {
      const element = positions[index];
      const ellipsoid = this.viewer.scene.globe.ellipsoid;
      const cartographic = ellipsoid.cartesianToCartographic(element);
      let x = Cesium.Math.toDegrees(cartographic.longitude);
      let y = Cesium.Math.toDegrees(cartographic.latitude);
      let data = { longitude: x, latitude: y };
      posDegrees.push(data);
    }
    console.log('转换成经纬度的点', posDegrees);
    let offset, x, y;
    for (let i = 0; i < interNumber; ++i) {
      offset = i / (interNumber - 1);
      // 做插值
      x = Cesium.Math.lerp(posDegrees[posDegrees.length - 2].longitude, posDegrees[posDegrees.length - 1].longitude, offset);
      y = Cesium.Math.lerp(posDegrees[posDegrees.length - 2].latitude, posDegrees[posDegrees.length - 1].latitude, offset);
      this.interData.push([x, y]);
    }
    console.log('插值点', this.interData);
    // 查询地图的地形高度
    const terrainProvider = await Cesium.createWorldTerrainAsync({
      requestVertexNormals: true
    });
    let interDataMap = this.interData.map((d: [number, number]) => Cesium.Cartographic.fromDegrees(...d));
    // 根据地形和经纬度计算出高度
    Cesium.sampleTerrainMostDetailed(terrainProvider, interDataMap).then(positions => {
      const heightList = positions.map((d: any) => ({
        height: d.height,
        longitude: Cesium.Math.toDegrees(d.longitude),
        latitude: Cesium.Math.toDegrees(d.latitude)
      }));
      console.log('剖面分析结果', heightList);
      alert(JSON.stringify(heightList));
    });
  }

  /**
   * @name: disposeChart
   * @Date: 2022-09-28 09:42:46
   * @description: 销毁剖面图
   */
  public disposeChart() {
    echarts.dispose(this.echartRef);
  }
}
