const Cesium = window.Cesium;
const AddGeoJson = () => {
  var viewer = window.Viewer;
  Cesium.GeoJsonDataSource.load('/static/geojson/故宫.geojson')
    .then(function (data: any) {
      data.name = '故宫geojson';
      viewer.dataSources.add(data);
      const entities = data.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        var height = entity.properties.height._value;
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.outline = false;
        // 将高度拉伸至高度属性值
        entity.polygon.extrudedHeight = height != null ? height : 5;
      }
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(116.397041, 39.916351, 8000.0), // 设置位置
        orientation: {
          heading: Cesium.Math.toRadians(20.0), // 方向
          pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
          roll: 0
        },
        duration: 3, // 设置飞行持续时间，默认会根据距离来计算
        complete: function () {
          //TODO
        }, // 到达位置后执行的回调函数
        cancle: function () {
          //TODO
        }, // 如果取消飞行则会调用此函数
        pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
        maximumHeight: 5000, // 相机最大飞行高度
        flyOverLongitude: 100 // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度(这个，很好用)});
      });
    })
    .then(() => {
      // // 获取已加载的数据源（假设这是在同一个上下文中）
      // var dataSources = viewer.dataSources;
      // // 遍历所有数据源
      // for (var i = 0; i < dataSources.length; i++) {
      //     var dataSource = dataSources.get(i);
      //     // 检查是否是你加载的故宫数据源
      //     if (dataSource.name === "故宫geojson") {  // 注意替换成实际的数据源名称
      //         var entities = dataSource.entities.values;
      //         console.log(111)
      //         // 遍历故宫数据源中的实体
      //         for (var j = 0; j < entities.length; j++) {
      //             var entity = entities[j];
      //             // 进行属性修改，例如修改颜色
      //             entity.polygon.material = Cesium.Color.RED;
      //         }
      //     }
      // }
    });
};
export default AddGeoJson;
