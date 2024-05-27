const Cesium = window.Cesium;
const ViewshedAnalysis = () => {
  /**
   * 空间分析-可视域分析
   * @param {Number} verticalViewAngle 垂直视角
   * @param {Number} horizontalViewAngle 水平视角
   * @param {Number} viewHeading 方位角
   * @param {Number} distance 视域距离
   */
  let options = {
    viewPosition: Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height),
    verticalViewAngle: verticalViewAngle,
    horizontalViewAngle: horizontalViewAngle,
    viewHeading: viewHeading,
    viewDistance: distance
  };
  var viewer = window.viewer;
  var that = this;
  this.clearHelsing();
  var viewPosition = options.viewPosition;
  var viewDistance = options.viewDistance || 100.0;
  var viewHeading = options.viewHeading || 0.0;
  var viewPitch = options.viewPitch || 0.0;
  var horizontalViewAngle = options.horizontalViewAngle || 90.0;
  var verticalViewAngle = options.verticalViewAngle || 60.0;
  var visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
  var invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
  var enabled = typeof options.enabled === 'boolean' ? options.enabled : true;
  var softShadows = typeof options.softShadows === 'boolean' ? options.softShadows : true;
  var size = options.size || 2048;
  var lightCamera = null;
  var shadowMap = null;
  createLightCamera();
  createShadowMap();
  createPostStage();
  drawFrustumOutine();
  drawSketch();
  // 创建相机
  function createLightCamera() {
    lightCamera = new Cesium.Camera(viewer.scene);
    lightCamera.position = viewPosition;
    lightCamera.frustum.near = viewDistance * 0.001;
    lightCamera.frustum.far = viewDistance;
    const hr = Cesium.Math.toRadians(horizontalViewAngle);
    const vr = Cesium.Math.toRadians(verticalViewAngle);
    const aspectRatio = (viewDistance * Math.tan(hr / 2) * 2) / (viewDistance * Math.tan(vr / 2) * 2);
    lightCamera.frustum.aspectRatio = aspectRatio;
    if (hr > vr) {
      lightCamera.frustum.fov = hr;
    } else {
      lightCamera.frustum.fov = vr;
    }
    lightCamera.setView({
      destination: viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(viewHeading || 0),
        pitch: Cesium.Math.toRadians(viewPitch || 0),
        roll: 0
      }
    });
    createShadowMap();
  }
  // 创建阴影贴图
  function createShadowMap() {
    shadowMap = new Cesium.ShadowMap({
      context: viewer.scene.context,
      lightCamera: lightCamera,
      enabled: enabled,
      isPointLight: true,
      pointLightRadius: viewDistance,
      cascadesEnabled: false,
      size: size,
      softShadows: softShadows,
      normalOffset: false,
      fromLightSource: false
    });
    viewer.scene.shadowMap = shadowMap;
  }
  // 创建PostStage
  function createPostStage() {
    const fs = glsl();
    that.postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        shadowMap_textureCube: () => {
          shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(shadowMap, '_shadowMapTexture');
        },
        shadowMap_matrix: () => {
          shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(shadowMap, '_shadowMapMatrix');
        },
        shadowMap_lightPositionEC: () => {
          shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(shadowMap, '_lightPositionEC');
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          const bias = shadowMap._pointBias;
          return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, shadowMap._distance, shadowMap.maximumDistance, 0.0, new Cesium.Cartesian4());
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          const bias = shadowMap._pointBias;
          const scratchTexelStepSize = new Cesium.Cartesian2();
          const texelStepSize = scratchTexelStepSize;
          texelStepSize.x = 1.0 / shadowMap._textureSize.x;
          texelStepSize.y = 1.0 / shadowMap._textureSize.y;

          return Cesium.Cartesian4.fromElements(texelStepSize.x, texelStepSize.y, bias.depthBias, bias.normalShadingSmooth, new Cesium.Cartesian4());
        },
        camera_projection_matrix: lightCamera.frustum.projectionMatrix,
        camera_view_matrix: lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return viewDistance;
        },
        helsing_visibleAreaColor: visibleAreaColor,
        helsing_invisibleAreaColor: invisibleAreaColor
      }
    });
    that.postStage = viewer.scene.postProcessStages.add(that.postStage);
  }
  // 创建视锥线
  function drawFrustumOutine() {
    const scratchRight = new Cesium.Cartesian3();
    const scratchRotation = new Cesium.Matrix3();
    const scratchOrientation = new Cesium.Quaternion();
    const position = lightCamera.positionWC;
    const direction = lightCamera.directionWC;
    const up = lightCamera.upWC;
    let right = lightCamera.rightWC;
    right = Cesium.Cartesian3.negate(right, scratchRight);
    let rotation = scratchRotation;
    Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
    Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
    Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
    let orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);

    let instance = new Cesium.GeometryInstance({
      geometry: new Cesium.FrustumOutlineGeometry({
        frustum: lightCamera.frustum,
        origin: viewPosition,
        orientation: orientation
      }),
      id: Math.random().toString(36).substr(2),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.YELLOWGREEN //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
        ),
        show: new Cesium.ShowGeometryInstanceAttribute(true)
      }
    });

    that.frustumOutline = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    );
  }
  // 创建创建视网
  function drawSketch() {
    that.sketch = viewer.entities.add({
      name: 'sketch',
      id: 'sketch',
      position: viewPosition,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(viewPosition, Cesium.HeadingPitchRoll.fromDegrees(viewHeading - horizontalViewAngle, viewPitch, 0.0)),
      ellipsoid: {
        radii: new Cesium.Cartesian3(viewDistance, viewDistance, viewDistance),
        // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: Cesium.Math.toRadians(-horizontalViewAngle / 2),
        maximumClock: Cesium.Math.toRadians(horizontalViewAngle / 2),
        minimumCone: Cesium.Math.toRadians(verticalViewAngle + 7.75),
        maximumCone: Cesium.Math.toRadians(180 - verticalViewAngle - 7.75),
        fill: false,
        outline: true,
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 64,
        outlineColor: Cesium.Color.YELLOWGREEN
      }
    });
  }
  function getHeading(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
  }
  function getPitch(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
  }
  // 着色器
  function glsl() {
    return `
    #define USE_CUBE_MAP_SHADOW true
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    varying vec2 v_textureCoordinates;
    uniform mat4 camera_projection_matrix;
    uniform mat4 camera_view_matrix;
    uniform samplerCube shadowMap_textureCube;
    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    uniform float helsing_viewDistance; 
    uniform vec4 helsing_visibleAreaColor;
    uniform vec4 helsing_invisibleAreaColor;
    struct zx_shadowParameters
    {
        vec3 texCoords;
        float depthBias;
        float depth;
        float nDotL;
        vec2 texelStepSize;
        float normalShadingSmooth;
        float darkness;
    };
    float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
    {
        float depthBias = shadowParameters.depthBias;
        float depth = shadowParameters.depth;
        float nDotL = shadowParameters.nDotL;
        float normalShadingSmooth = shadowParameters.normalShadingSmooth;
        float darkness = shadowParameters.darkness;
        vec3 uvw = shadowParameters.texCoords;
        depth -= depthBias;
        float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
        return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
    }
    vec4 getPositionEC(){
        return czm_windowToEyeCoordinates(gl_FragCoord);
    }
    vec3 getNormalEC(){
        return vec3(1.);
    }
    vec4 toEye(in vec2 uv,in float depth){
        vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
        vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
        posInCamera=posInCamera/posInCamera.w;
        return posInCamera;
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
        vec3 v01=point-planeOrigin;
        float d=dot(planeNormal,v01);
        return(point-planeNormal*d);
    }
    float getDepth(in vec4 depth){
        float z_window=czm_unpackDepth(depth);
        z_window=czm_reverseLogDepth(z_window);
        float n_range=czm_depthRange.near;
        float f_range=czm_depthRange.far;
        return(2.*z_window-n_range-f_range)/(f_range-n_range);
    }
    float shadow(in vec4 positionEC){
        vec3 normalEC=getNormalEC();
        zx_shadowParameters shadowParameters;
        shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
        shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
        shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
        shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
        vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
        float distance=length(directionEC);
        directionEC=normalize(directionEC);
        float radius=shadowMap_lightPositionEC.w;
        if(distance>radius)
        {
            return 2.0;
        }
        vec3 directionWC=czm_inverseViewRotation*directionEC;
        shadowParameters.depth=distance/radius-0.0003;
        shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
        shadowParameters.texCoords=directionWC;
        float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
        return visibility;
    }
    bool visible(in vec4 result)
    {
        result.x/=result.w;
        result.y/=result.w;
        result.z/=result.w;
        return result.x>=-1.&&result.x<=1.
        &&result.y>=-1.&&result.y<=1.
        &&result.z>=-1.&&result.z<=1.;
    }
    void main(){
        // 釉色 = 结构二维(颜色纹理, 纹理坐标)
        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
        // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
        float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
        // 视角 = (纹理坐标, 深度)
        vec4 viewPos = toEye(v_textureCoordinates, depth);
        // 世界坐标
        vec4 wordPos = czm_inverseView * viewPos;
        // 虚拟相机中坐标
        vec4 vcPos = camera_view_matrix * wordPos;
        float near = .001 * helsing_viewDistance;
        float dis = length(vcPos.xyz);
        if(dis > near && dis < helsing_viewDistance){
            // 透视投影
            vec4 posInEye = camera_projection_matrix * vcPos;
            // 可视区颜色
            // vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
            // vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
            if(visible(posInEye)){
                float vis = shadow(viewPos);
                if(vis > 0.3){
                    gl_FragColor = mix(gl_FragColor,helsing_visibleAreaColor,.5);
                } else{
                    gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
                }
            }
        }
    }`;
  }
};
export default ViewshedAnalysis;
