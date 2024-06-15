const Cesium = window.Cesium;
export default () => {
  var data = [
    {
      x: 117.102442,
      y: 36.185321,
      z: 0
    },
    {
      x: 117.202442,
      y: 36.185321,
      z: 0
    },
    {
      x: 117.202442,
      y: 36.195321,
      z: 0
    }
  ];
  /**
   * 添加glb模型（轨迹移动）
   * @param {Array} data 轨迹坐标数组
   */
  var viewer = window.viewer;
  let url = '/static/Cesium_Man.glb';
  let name = '模型';
  let position = new Cesium.Cartesian3.fromDegrees(data[0].x, data[0].y, data[0].z);
  var lineList = [];
  /* 初始化取景器计时器
   * 设所有坐标的间隔均为30s，以此计算总的轨迹持续时间
   * 算出轨迹移动的开始时间和结束时间，其中开始时间为已知的移动出发时间，结束时间是开始时间和总持续时间的总和
   * 通过将轨迹的开始和结束时间设置为起点和终点来初始化取景器的计时器
   * 同时将取景器的当前时间设置为计时器开始时间 */
  // 时间间隔30s
  const timeStepInSeconds = 30;
  // 总时长为时间间隔 * （雷达点数 - 1）
  const totalSeconds = timeStepInSeconds * (data.length - 1);
  // 设置开始时间，使用根据国际标准ISO8601时间转换的儒略历时间
  const start = Cesium.JulianDate.fromIso8601('2023-01-01T23:10:00Z');
  // 新建一个实例并将其设置为结束时间，结束时间为起点加上总时长
  const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
  // 生成开始时间的副本，并令其为取景器计时器的起点
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  // 令取景器的当前时间为开始时间
  viewer.clock.currentTime = start.clone();
  // 用开始时间和结束时间设置取景器的时间线
  viewer.timeline.zoomTo(start, stop);
  // 设置初始速度
  viewer.clock.multiplier = 1;
  // 允许加速播放
  viewer.clock.shouldAnimate = true;
  //时间轴执行完后停止
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  // 取样位置 相当于一个集合
  const positionProperty = new Cesium.SampledPositionProperty();
  // 为每个雷达坐标建立对应时间和位置信息的实体点
  for (let i = 0; i < data.length; i++) {
    const dataPoint = data[i];
    // 线的坐标
    lineList.push(dataPoint.x);
    lineList.push(dataPoint.y);
    lineList.push(dataPoint.z);
    const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
    const position = Cesium.Cartesian3.fromDegrees(dataPoint.x, dataPoint.y, 0);
    // 添加位置，和时间对应
    positionProperty.addSample(time, position);
    viewer.entities.add({
      description: `Location: (${dataPoint.x}, ${dataPoint.y}, ${0})`,
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
  }
  const modelEntity = viewer.entities.add({
    // 和时间轴关联
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: start, stop: stop })]),
    // 设置位置
    position: positionProperty,
    model: {
      uri: url,
      minimumPixelSize: 100,
      maximumScale: 20000,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    },
    // 根据所提供的速度计算模型朝向
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    // 飞行路径
    path: new Cesium.PathGraphics({ width: 3 })
  });
  // 镜头跟踪
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(data[0].x, data[0].y, 10000)
  });
  viewer.trackedEntity = modelEntity;
  //轨迹线
  const Line = viewer.entities.add({
    name: '轨迹线',
    polyline: {
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(lineList),
      width: 5,
      material: Cesium.Color.YELLOW,
      clampToGround: true
    }
  });
};
