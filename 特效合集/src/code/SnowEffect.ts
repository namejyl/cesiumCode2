const Cesium = window.Cesium;
export default () => {
  let snowStage = null;
  var viewer = window.viewer;
  let option = {
    snowSize: 0.01, // 雪花大小，值越大雪花越大 最好不要超过0.01
    snowSpeed: 60 // 雪花速度，值越大雪花越慢
  };
  snowStage = new Cesium.PostProcessStage({
    name: 'czm_snow',
    fragmentShader:
      'uniform sampler2D colorTexture;\n\
    in vec2 v_textureCoordinates;\n\
    \n\
    uniform float snowSpeed;\n\
    uniform float snowSize;\n\
    float snow(vec2 uv,float scale){\n\
        float time = czm_frameNumber / snowSpeed;\n\
        float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
        if(w<.1)return 0.;\n\
        uv+=time/scale;\n\
        uv.y+=time*2./scale;\n\
        uv.x+=sin(uv.y+time*.5)/scale;\n\
        uv*=scale;\n\
        vec2 s=floor(uv),f=fract(uv),p;\n\
        float k=3.,d;\n\
        p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
        d=length(p);\n\
        k=min(d,k);\n\
        k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);\n\
        return k*w;\n\
    }\n\
    \n\
    void main(){\n\
        vec2 resolution = czm_viewport.zw;\n\
        vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
        vec3 finalColor=vec3(0);\n\
        float c = 0.0;\n\
        c+=snow(uv,30.)*.0;\n\
        c+=snow(uv,20.)*.0;\n\
        c+=snow(uv,15.)*.0;\n\
        c+=snow(uv,10.);\n\
        c+=snow(uv,8.);\n\
        c+=snow(uv,6.);\n\
        c+=snow(uv,5.);\n\
        finalColor=(vec3(c));\n\
        out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
        \n\
    }\n\
    ',
    uniforms: {
      snowSize: () => {
        return option.snowSize;
      },
      snowSpeed: () => {
        return option.snowSpeed;
      }
    }
  });
  viewer.scene.postProcessStages.add(snowStage);
};
