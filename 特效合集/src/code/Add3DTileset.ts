const Cesium = window.Cesium;
const Add3DTileset = () => {
  let viewer = window.viewer;
  let tileSetModel = new Cesium.Cesium3DTileset({
    url: '/static/3DT/dayanta/tileset.json'
  });

  // 加载3D瓦片集模型
  tileSetModel.readyPromise
    .then((tileset: any) => {
      // 将3D瓦片集的边界球中心转换为地理坐标
      let cartographicCenter = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);

      // 使用sampleTerrainMostDetailed函数获取边界球中心的地形高度
      Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographicCenter]).then(function (samples: any) {
        // 更新地形高度
        cartographicCenter.height = samples[0].height;

        // 根据地形高度更新模型位置
        let surfaceCenter = Cesium.Cartesian3.fromRadians(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height);
        let translation = Cesium.Cartesian3.subtract(surfaceCenter, tileset.boundingSphere.center, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        // 将模型添加到场景中
        viewer.scene.primitives.add(tileset);
        // 调整视角至模型位置
        viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
      });
    })
    .catch(function (error: any) {
      console.log(error);
    });
};
export default Add3DTileset;
