const Cesium = window.Cesium;
export default () => {
  /**
   * 雨天效果
   */
  let rainStage = null;
  var viewer = window.viewer;
  let option = {
    tiltAngle: -0.1, //倾斜角度，负数向右，正数向左
    rainSize: 0.6, // 雨大小
    rainSpeed: 120.0 // 雨速
  };
  rainStage = new Cesium.PostProcessStage({
    name: 'czm_rain',
    fragmentShader:
      'uniform sampler2D colorTexture;\n\
      in vec2 v_textureCoordinates;\n\
      uniform float tiltAngle;\n\
      uniform float rainSize;\n\
      uniform float rainSpeed;\n\
      float hash(float x) {\n\
          return fract(sin(x * 133.3) * 13.13);\n\
      }\n\
      void main(void) {\n\
          float time = czm_frameNumber / rainSpeed;\n\
          vec2 resolution = czm_viewport.zw;\n\
          vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
          vec3 c = vec3(.6, .7, .8);\n\
          float a = tiltAngle;\n\
          float si = sin(a), co = cos(a);\n\
          uv *= mat2(co, -si, si, co);\n\
          uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
          float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
          float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
          c *= v * b;\n\
          out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
      }\n\
      ',
    uniforms: {
      tiltAngle: () => {
        return option.tiltAngle;
      },
      rainSize: () => {
        return option.rainSize;
      },
      rainSpeed: () => {
        return option.rainSpeed;
      }
    }
  });
  viewer.scene.postProcessStages.add(rainStage);
};
