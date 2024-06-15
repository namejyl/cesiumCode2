const Cesium = window.Cesium;
export default () => {
  let fogStage = null;
  var viewer = window.viewer;
  let option = {
    visibility: 0.2,
    color: new Cesium.Color(0.8, 0.8, 0.8, 0.3)
  };
  fogStage = new Cesium.PostProcessStage({
    name: 'czm_fog',
    fragmentShader:
      'uniform sampler2D colorTexture;\n\
    uniform sampler2D depthTexture;\n\
    uniform float visibility;\n\
    uniform vec4 fogColor;\n\
    in vec2 v_textureCoordinates; \n\
    void main(void) \n\
    { \n\
        vec4 origcolor = texture(colorTexture, v_textureCoordinates); \n\
        float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
        vec4 depthcolor = texture(depthTexture, v_textureCoordinates); \n\
        float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
        if (f < 0.0) f = 0.0; \n\
        else if (f > 1.0) f = 1.0; \n\
        out_FragColor = mix(origcolor, fogColor, f); \n\
    }\n',
    uniforms: {
      visibility: () => {
        return option.visibility;
      },
      fogColor: () => {
        return option.color;
      }
    }
  });
  viewer.scene.postProcessStages.add(fogStage);
};
