const Cesium = window.Cesium;
const AddGeoJson = () => {
  var viewer = window.Viewer;
  Cesium.GeoJsonDataSource.load('/static/geojson/故宫.geojson')
    .then(function (data: any) {
      data.name = '故宫geojson';
      let entity = viewer.dataSources.add(data);
      const entities = data.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        var height = entity.properties.height._value;
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.outline = false;
        // 将高度拉伸至高度属性值
        entity.polygon.extrudedHeight = height != null ? height : 5;
      }
      viewer.zoomTo(entity);
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
