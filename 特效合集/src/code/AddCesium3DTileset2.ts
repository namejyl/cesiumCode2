const Cesium = window.Cesium;
export default () => {
  /**
   * 添加三维模型
   * @param: style {Boolean} 是否加载渐变和动态光环
   */
  let viewer = window.viewer;
  //模型加载
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(75343)
    })
  );
  tileset.tileVisible.addEventListener(function (tile: any) {
    let content = tile.content;
    let featuresLength = content.featuresLength;
    for (let i = 0; i < featuresLength; i += 2) {
      let feature = content.getFeature(i);
      let model = feature.content._model;
      if (model && model._pipelineResources) {
        let program = model._pipelineResources[1];
        program._fragmentShaderSource.sources[0] = `
        varying vec3 v_positionEC;
          void main(void){
            vec4 position = czm_inverseModelView * vec4(v_positionEC,1); // 位置
            float glowRange = 300.0; // 光环的移动范围(高度)
            gl_FragColor = vec4(0.0, 0.3, 0.8, 0.8); // 颜色
            
            // 小于20米的低楼都不再变暗
            if(position.y > 20.0) {
              gl_FragColor *= vec4(vec3(position.y / 20.0), 0.8); // 渐变
            }
            
            // 动态光环
            float time = fract(czm_frameNumber / 360.0);
            time = abs(time - 0.1) * 1.0;
            float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
            gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
          }
        `;
      }
    }
  });

  viewer.camera.setView({
    destination: new Cesium.Cartesian3(1332761, -4662399, 4137888),
    orientation: {
      heading: 0.6,
      pitch: -0.66
    }
  });
};
