import backImg from '@/assets/images/风景1.png';
import negativeXImg from '@/assets/images/skybox/yonder_lf.jpg';
import positiveXImg from '@/assets/images/skybox/yonder_rt.jpg';
import negativeYImg from '@/assets/images/skybox/yonder_ft.jpg';
import positiveYImg from '@/assets/images/skybox/yonder_bk.jpg';
import negativeZImg from '@/assets/images/skybox/yonder_dn.jpg';
import positiveZImg from '@/assets/images/skybox/yonder_up.jpg';
import gradientImg from '@/assets/images/404.png';
import hexagonImg from '@/assets/images/hexagon.png';
import waterNormalsImg from '@/assets/images/waterNormals.png';
import colorsImg from '@/assets/images/colors.png';
import arrowImg from '@/assets/images/arrow.png';
import circle_rotateImg from '@/assets/images/circle_rotate.png';
import radarImg from '@/assets/images/radar.png';
import billbordImg from '@/assets/images/BluePin1LargeB.png';
import cluster_1Img from '@/assets/images/cluster_1.png';
import cluster_2Img from '@/assets/images/cluster_2.png';
import cluster_3Img from '@/assets/images/cluster_3.png';
import cluster_4Img from '@/assets/images/cluster_4.png';
import poiImg from '@/assets/images/GreenPin1LargeB.png';
import fire1Img from '@/assets/images/fire1.png';
import waterImg from '@/assets/images/water.png';
import explosionImg from '@/assets/images/explosion.png';
import bottomdzImg from '@/assets/images/excavate_side_min.jpg';
import excavateImg from '@/assets/images/dzmc.jpg';
import * as turf from '@turf/turf';
import * as THREE from 'three';
import { Message } from 'element-ui';
import $ from 'jquery';
import * as echarts from 'echarts';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import Prompt from '../util/heatmap3d/prompt/prompt.js';
import util from '../util/heatmap3d/util.js';
import Heatmap3d from '../util/heatmap3d/heatmap3d.js';
import { Delaunay } from 'd3-delaunay';
import Vue from 'vue';

require('echarts/theme/macarons'); // echarts 主题
// Cesium 球体操作相关（加载数据，定位、高亮等）
export default {
  cesium: {
    viewer: null
  },
  three: {
    renderer: null,
    camera: null,
    scene: null
  },
  globe: null,
  minWGS84: [115.23, 39.55],
  maxWGS84: [116.23, 41.55],
  _3Dobjects: [],
  viewer: null,
  view2D: null,
  OnlineMaps: {}, //加载到地图中的地图图层
  TransparencyAlpha: 0.1, //地面透明值
  clampToGround: true, //是否贴地
  measure: null,
  _isMainMapTrigger: false, //是否是主地图触发的事件
  _isEyeMapTrigger: false, //是否是鹰眼地图触发的事件
  _amount: 0.2,
  react: null,
  snowStage: null,
  rainStage: null,
  fogStage: null,
  endRotate: false,
  handler: null, // handler句柄
  iLength: 0, // 已经读取的视域点
  jLength: 0, // 已经读取的目标点
  viewPoints: [], // 视域点
  targetPoints: [], // 目标点
  parentEntity: null, // 父实体
  longitude: 0, // 经度
  latitude: 0, // 纬度
  height: 0, // 高度
  frustumOutline: null, // 视域线
  postStage: null, // 后期处理
  sketch: null, // 测量线
  lastStageList: [], // 上一次的后期处理
  wellData: [], // 井数据
  clippingPoints: [], // 剖切面
  tempEntities: [], // 临时实体
  baseHeight: 0, // 基准高度
  resultPoints: [],
  globalHandler: null, // 全局handler
  /**
   * 实例化球及加载地图
   * @param：divobj {String} 地图容器id 【必选】
   * @param:vueObj {Object} Vue对象 【必选】
   */
  initEarth: function (divobj) {
    let _this = this;
    _this.divElement = divobj;
    //cesium密钥
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjUwNWQyOC0yZmZhLTRmMzItOTQyZC02ZmQyMWIyMTA3NmEiLCJpZCI6NjcyNzcsImlhdCI6MTY2ODE1ODc2Mn0.t1h6-ZADkGnZUZZoLtrlgtTp8_MR2Kxfhew42ksDgmk';
    // 实例化地球
    let viewerOption = {
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      }),
      terrainProvider: Cesium.createWorldTerrain(),
      homeButton: true,
      sceneModePicker: true,
      baseLayerPicker: true,
      navigationHelpButton: true,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      //关闭点选出现的提示框
      selectionIndicator: false,
      infoBox: false,
      // useDefaultRenderLoop: false,
      // selectionIndicator: false,
      // infoBox: false,
      // navigationInstructionsInitiallyVisible: false,
      // fullscreenButton: false,
      // allowTextureFilterAnisotropic: false,
      // contextOptions: {
      //   webgl: {
      //     alpha: false,
      //     antialias: true,
      //     preserveDrawingBuffer: true,
      //     failIfMajorPerformanceCaveat: false,
      //     depth: true,
      //     stencil: false,
      //     anialias: false,
      //   },
      // },
      // targetFrameRate: 60,
      // resolutionScale: 0.1,
      // orderIndependentTranslucency: true,
      // imageryProvider: undefined,
      // baseLayerPicker: false,
      // automaticallyTrackDataSourceClocks: false,
      // dataSources: null,
      // clock: null,
      // terrainShadows: Cesium.ShadowMode.DISABLED,

      //  useDefaultRenderLoop: false,           //关闭自动渲染
      geocoder: false, // 地名查找,默认true
      homeButton: false, // 主页按钮，默认true
      sceneModePicker: false, //二三维切换按钮
      baseLayerPicker: false, // 地图切换控件(底图以及地形图)是否显示,默认显示true
      navigationHelpButton: false, // 问号图标，导航帮助按钮，显示默认的地图控制帮助
      // animation: false, // 动画控制，默认true .
      shouldAnimate: true, // 是否显示动画控制，默认true .
      shadows: true, // 阴影
      timeline: true, // 时间轴,默认true .
      CreditsDisplay: false, // 展示数据版权属性
      fullscreenButton: false, // 全屏按钮,默认显示true
      infoBox: false, // 点击要素之后显示的信息,默认true
      selectionIndicator: false, // 选中元素显示,默认true
      contextOptions: {
        preserveDrawingBuffer: true //cesium状态下允许canvas转图片convertToImage
      }
      // contextOptions: {
      //   webgl: {
      //     alpha: false,
      //     antialias: true,
      //     preserveDrawingBuffer: true,   //cesium状态下允许canvas转图片convertToImage
      //     failIfMajorPerformanceCaveat: false,
      //     depth: true,
      //     stencil: false,
      //     anialias: false,
      //   },
      // },
    };
    var viewer_t = this.viewer;
    if (viewer_t != null) {
      viewer_t.destroy();
    }
    let viewer = new Cesium.Viewer(divobj, viewerOption);
    let view2D = new Cesium.Viewer('view2D', {
      sceneMode: Cesium.SceneMode.SCENE2D
    });
    this.cesium.viewer = viewer;
    //导航插件（罗盘、比例尺）
    viewer.extend(Cesium.viewerCesiumNavigationMixin, {
      enableCompassOuterRing: true
    });
    //视角默认定位到中国上空
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
      75.0, // 东
      0.0, // 南
      140.0, // 西
      60.0 // 北
    );

    _this.viewer = viewer;
    _this.view2D = view2D;
    _this.globe = viewer.scene.globe;
    _this.parentEntity = viewer.entities.add(new Cesium.Entity());
    _this.measure = new Cesium.Measure(_this.viewer);

    viewer._cesiumWidget._creditContainer.style.display = 'none'; // 去掉版权信息（logo）
    viewer.scene.globe.enableLighting = false; //开启场景光照阴影
    //设置初始化球体遮挡
    viewer.scene.highDynamicRange = !1;
    viewer.scene.globe.depthTestAgainstTerrain = true; // 深度检测
    viewer.scene.postProcessStages.fxaa.enabled = false; //抗锯齿
    viewer.screenSpaceEventHandler.setInputAction(function () {}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //禁用双击
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2023-02-01T00:00:08');
    // 显示帧率
    viewer.scene.debugShowFramesPerSecond = false;
    // 添加地形数据
    //viewer.terrainProvider = Cesium.createWorldTerrain();

    viewer.terrainProvider = Cesium.createWorldTerrain({
      requestVertexNormals: true,
      requestWaterMask: true
    });

    // //地形夸张
    // viewer.scene.globe.terrainExaggeration = 1.3;

    // 加载地形数据
    // const terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: Cesium.IonResource.fromAssetId(1),
    //   requestWaterMask: true, //请求水体效果所需要的海岸线数据
    //   requestVertexNormals: true //请求地形照明数据
    // });
    // viewer.terrainProvider = terrainProvider;

    // viewer.scene.debugShowCommands = true;

    // // 自定义背景色（当设置背景色时，天空盒skyBox必须不显示才可以）
    // viewer.scene.skyBox.show = false;
    // viewer.scene.backgroundColor = Cesium.Color.GREEN;
    viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
    //定位到中国范围
    _this.FlyToChina();
    /*添加地图到地球*/
    _this.AddDataToEarth();
    //设置相机位置
    viewer.camera.setView({
      // 定义相机的目标位置(笛卡尔坐标)
      destination: {
        x: -2349785.4381783823,
        y: 4596905.031779513,
        z: 3743318.751622788
      },
      // 定义相机的方向和角度
      orientation: {
        // 相机的偏转角度（heading表示从正北开始逆时针旋转的角度。其数值是以弧度表示的。一个值为0的heading通常表示正北）
        // 偏航角（飞机向左飞还是向右飞）
        heading: 0.1015029573852555,
        // 相机的上下倾斜角度（一个负的pitch值表示相机是向下倾斜的。）
        // 俯仰角（飞机向上抬头或是向下低头）
        pitch: -0.3482370478292893,
        // 相机围绕其查看方向（或称前进方向）的旋转角度（当roll值为π/2或90°（转换为弧度）时，相机将绕其前进方向旋转90度。这意味着相机的“顶部”现在指向其右侧。）
        // 翻滚角（飞机沿前进方向轴顺时针翻转为正角度）
        roll: 0.00005029594533212389
      }
    });

    view2D.camera.setView({
      // 设置相机位置
      destination: {
        x: -2349785.4381783823,
        y: 4596905.031779513,
        z: 3743318.751622788
      },
      orientation: {
        // 初始视角
        heading: 0.1015029573852555,
        pitch: -0.3482370478292893,
        roll: 0.00005029594533212389
      }
    });
    _this.viewer.camera.percentageChanged = 0.01;
    // 监听三维地图变化
    _this.viewer.camera.changed.addEventListener(() => {
      this.Sync2D();
    });
    _this.Eye();
    _this.AddXyz();

    // 调用geoserver服务
    // _this.AddCzml()
    _this.Add3DTileset();
    // _this.AddGeoserverService();
    // 添加瓦片坐标信息,显示当前瓦片的层级、行列号
    // viewer.imageryLayers.addImageryProvider(
    //   new Cesium.TileCoordinatesImageryProvider()
    // );
    /*添加三维图层*/
    // _this.AddCesium3DTileset(viewer);
    //_this.Show3DCoordinates();
  },

  createThree(divobj) {
    var viewer = this.viewer;
    //   const realPos=[
    //     Cesium.Cartesian3.fromDegrees(117.202442,36.285321,1000).x,Cesium.Cartesian3.fromDegrees(117.202442,36.285321,1000).y,Cesium.Cartesian3.fromDegrees(117.202442,36.285321,1000).z,
    //     Cesium.Cartesian3.fromDegrees(117.202442,36.085321,1000).x,Cesium.Cartesian3.fromDegrees(117.202442,36.085321,1000).y,Cesium.Cartesian3.fromDegrees(117.202442,36.085321,1000).z,
    //     Cesium.Cartesian3.fromDegrees(117.102442,36.085321,1000).x,Cesium.Cartesian3.fromDegrees(117.102442,36.085321,1000).y,Cesium.Cartesian3.fromDegrees(117.102442,36.085321,1000).z,
    //     Cesium.Cartesian3.fromDegrees(117.102442,36.285321,1000).x,Cesium.Cartesian3.fromDegrees(117.102442,36.285321,1000).y,Cesium.Cartesian3.fromDegrees(117.102442,36.285321,1000).z,
    //   ]
    //   const __colors=[
    //     1,0,0,1,
    //     1,0,0,1,
    //     1,0,0,1,
    //     1,0,0,1,
    //   ]
    //   const __indices=[
    //     0,1,2,3
    //   ]
    //   function generateGeometry(realPos, __colors, __indices) {
    //     /**
    //      * 构造 几何体的 内部属性
    //      */
    //     var attributes = new Cesium.GeometryAttributes({
    //         position: new Cesium.GeometryAttribute({
    //             componentDatatype: Cesium.ComponentDatatype.DOUBLE,
    //             componentsPerAttribute: 3,
    //             values: new Float64Array(realPos),
    //         }),
    //         color: new Cesium.GeometryAttribute({
    //             componentDatatype: Cesium.ComponentDatatype.FLOAT,
    //             componentsPerAttribute: 4,
    //             values: new Float32Array(__colors),
    //         }),
    //     })

    //     //包围球
    //     var boundingSphere = Cesium.BoundingSphere.fromVertices(
    //         realPos,
    //         new Cesium.Cartesian3(0.0, 0.0, 0.0),
    //         3
    //     )
    //     // console.log(boundingSphere)

    //     // 计算顶点法向量
    //     var geometry = new Cesium.Geometry({
    //         attributes: attributes,
    //         indices: __indices,
    //         primitiveType: Cesium.PrimitiveType.TRIANGLES,
    //         boundingSphere: boundingSphere,
    //     })
    //     return geometry
    // }
    // // 添加geometry 进场景

    //       //四面体的实例
    //       var instance = new Cesium.GeometryInstance({
    //           geometry: Cesium.GeometryPipeline.toWireframe(
    //               generateGeometry(realPos, __colors, __indices)
    //           ),
    //       })

    //   //加入场景
    //   viewer.scene.primitives.add(
    //       new Cesium.Primitive({
    //           geometryInstances: instance,
    //           appearance: new Cesium.PerInstanceColorAppearance({
    //               flat: true,
    //               translucent: false,
    //           }),
    //           asynchronous: false,
    //       })
    //   )

    //   var TetrahedronGeometry = function(){
    //     var negativeRootTwoOverThree = -Math.sqrt(2.0) / 3.0;
    //     var negativeOneThird = -1.0 / 3.0;
    //     var rootSixOverThree = Math.sqrt(6.0) / 3.0;

    //     //四面体的四个顶点
    //     var positions = new Float64Array(4 * 3);

    //     // position 0
    //     positions[0] = 0.0;
    //     positions[1] = 0.0;
    //     positions[2] = 1.0;

    //     // position 1
    //     positions[3] = 0.0;
    //     positions[4] = (2.0 * Math.sqrt(2.0)) / 3.0;
    //     positions[5] = negativeOneThird;

    //     // position 2
    //     positions[6] = -rootSixOverThree;
    //     positions[7] = negativeRootTwoOverThree;
    //     positions[8] = negativeOneThird;

    //     // position 3
    //     positions[9] = rootSixOverThree;
    //     positions[10] = negativeRootTwoOverThree;
    //     positions[11] = negativeOneThird;

    //     var attributes = new Cesium.GeometryAttributes({
    //         position : new Cesium.GeometryAttribute({
    //             componentDatatype : Cesium.ComponentDatatype.DOUBLE,
    //             componentsPerAttribute : 3,
    //             values : positions
    //         })
    //     });

    //     //顶点索引
    //     var indices = new Uint16Array(4 * 3);

    //     // back triangle
    //     indices[0] = 0;
    //     indices[1] = 1;
    //     indices[2] = 2;

    //     // left triangle
    //     indices[3] = 0;
    //     indices[4] = 2;
    //     indices[5] = 3;

    //     // right triangle
    //     indices[6] = 0;
    //     indices[7] = 3;
    //     indices[8] = 1;

    //     // bottom triangle
    //     indices[9] = 2;
    //     indices[10] = 1;
    //     indices[11] = 3;

    //     //包围球
    //     var boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(0.0,0.0,0.0),1.0);

    //     var geometry = Cesium.GeometryPipeline.computeNormal(new Cesium.Geometry({
    //         attributes: attributes,
    //         indices: indices,
    //         primitiveType: Cesium.PrimitiveType.TRIANGLES,
    //         boundingSphere: boundingSphere
    //     }));

    //     this.attributes = geometry.attributes;
    //     this.indices = geometry.indices;
    //     this.primitiveType = geometry.primitiveType;
    //     this.boundingSphere = geometry.boundingSphere;
    //     //this.boundingSphere = Cesium.BoundingSphere.fromVertices(positions);
    // };
    //   var scene = viewer.scene;
    //   var ellipsoid = viewer.scene.globe.ellipsoid
    //   //模型矩阵
    //   var modelMatrix = Cesium.Matrix4.multiplyByUniformScale(
    //           Cesium.Matrix4.multiplyByTranslation(
    //             Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
    //             new Cesium.Cartesian3(0.0, 0.0, 200000.0),
    //             new Cesium.Matrix4()),
    //          500000.0,Cesium.Matrix4.multiplyByTranslation(
    //           Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
    //           new Cesium.Cartesian3(0.0, 0.0, 200000.0),
    //           new Cesium.Matrix4()));

    //   //四面体的实例
    //   var instance = new Cesium.GeometryInstance({
    //     geometry : Cesium.GeometryPipeline.toWireframe(new TetrahedronGeometry()),
    //     modelMatrix : modelMatrix,
    //     attributes : {
    //         color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
    //     }
    // });
    //   //加入场景
    //   viewer.scene.primitives.add(new Cesium.Primitive({
    //       geometryInstances : instance,
    //       appearance : new Cesium.PerInstanceColorAppearance({
    //           flat : true,
    //           translucent : false
    //       })
    //   }));

    viewer.destroy();
    var viewerOption = {
      geocoder: false, // 地名查找,默认true
      homeButton: false, // 主页按钮，默认true
      sceneModePicker: false, //二三维切换按钮
      baseLayerPicker: false, // 地图切换控件(底图以及地形图)是否显示,默认显示true
      navigationHelpButton: false, // 问号图标，导航帮助按钮，显示默认的地图控制帮助
      // animation: false, // 动画控制，默认true .
      shouldAnimate: true, // 是否显示动画控制，默认true .
      shadows: true, // 阴影
      timeline: true, // 时间轴,默认true .
      CreditsDisplay: false, // 展示数据版权属性
      fullscreenButton: false, // 全屏按钮,默认显示true
      infoBox: true, // 点击要素之后显示的信息,默认true
      selectionIndicator: true, // 选中元素显示,默认true
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true, //cesium状态下允许canvas转图片convertToImage
          failIfMajorPerformanceCaveat: false,
          depth: true,
          stencil: false,
          anialias: false
        }
      }
    };
    let viewer_t = new Cesium.Viewer(divobj, viewerOption);
    this.cesium.viewer = viewer_t;

    this.initCesium();
    this.initThreejs();
    this.init3DObject();
    this.startRenderLoop();
  },
  /**
   *  startRenderLoop方法执行Cesium和Three.js的渲染，并在每一帧请求动画帧时绑定正确的上下文。
   */
  startRenderLoop() {
    this.cesium.viewer.render();
    this.threeRender();
    requestAnimationFrame(this.startRenderLoop.bind(this));
  },
  /**
   * threeRender方法将Cesium相机的投影和位置信息同步到Three.js相机，以便3D物体在两个库中正确显示。
   */
  threeRender() {
    let that = this;
    // 禁用Three.js相机的自动更新矩阵，以便我们可以手动更新它。
    that.three.camera.matrixAutoUpdate = false;
    // 从Cesium相机获取视图矩阵和逆视图矩阵。
    const cvm = that.cesium.viewer.camera.viewMatrix;
    const civm = that.cesium.viewer.camera.inverseViewMatrix;

    // 更新Three.js相机的matrixWorld和matrixWorldInverse，以匹配Cesium相机的位置和方向。
    that.three.camera.lookAt(0, 0, 0);
    that.three.camera.matrixWorld.set(civm[0], civm[4], civm[8], civm[12], civm[1], civm[5], civm[9], civm[13], civm[2], civm[6], civm[10], civm[14], civm[3], civm[7], civm[11], civm[15]);
    that.three.camera.matrixWorldInverse.set(cvm[0], cvm[4], cvm[8], cvm[12], cvm[1], cvm[5], cvm[9], cvm[13], cvm[2], cvm[6], cvm[10], cvm[14], cvm[3], cvm[7], cvm[11], cvm[15]);
    // 根据窗口大小调整Three.js渲染器的像素比例、宽度和高度。
    const canvas = that.three.renderer.domElement;
    that.three.renderer.setPixelRatio(window.devicePixelRatio);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      that.three.renderer.setSize(width, height, false);
    }

    // 更新Three.js相机的视角和投影矩阵。
    that.three.camera.aspect = width / height;
    that.three.camera.fov = Cesium.Math.toDegrees(that.cesium.viewer.camera.frustum.fovy);
    that.three.camera.updateProjectionMatrix();

    // 使用Three.js渲染器渲染场景和相机。
    that.three.renderer.render(that.three.scene, that.three.camera);
  },
  /**
   * initCesium方法用于初始化Cesium地图，并将相机视角设置为中心点和特定方向。
   */
  initCesium() {
    // 计算并设置相机的飞行目标。
    const center = Cesium.Cartesian3.fromDegrees((this.minWGS84[0] + this.maxWGS84[0]) / 2, (this.minWGS84[1] + this.maxWGS84[1]) / 2 - 1, 200000);
    this.cesium.viewer.camera.flyTo({
      destination: center,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: Cesium.Math.toRadians(0)
      },
      duration: 3
    });
  },
  /**
   * initThreejs方法用于初始化Three.js场景、相机和渲染器，并将其添加到DOM元素。
   */

  initThreejs() {
    // 获取画布并设置WebGL渲染器。
    const canvas = document.querySelector('#ThreeContainer');
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      logarithmicDepthBuffer: true,
      antialias: true
    });

    // 创建透视相机。
    var fov = 45;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var aspect = width / height;
    var near = 1;
    var far = 10 * 1000 * 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // 创建Three.js场景。
    const scene = new THREE.Scene();

    // 将渲染器、场景和相机存储到this.three对象中。
    this.three.renderer = renderer;
    this.three.scene = scene;
    this.three.camera = camera;
  },
  /**
   * init3DObject方法用于在Cesium和Three.js中添加3D物体。
   */
  init3DObject() {
    // 添加Cesium实体。
    const entity = {
      name: 'Polygon',
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([this.minWGS84[0], this.minWGS84[1], this.maxWGS84[0], this.minWGS84[1], this.maxWGS84[0], this.maxWGS84[1], this.minWGS84[0], this.maxWGS84[1]]),
        material: Cesium.Color.RED.withAlpha(0.2)
      }
    };
    // 将Cesium实体添加到viewer中
    this.cesium.viewer.entities.add(entity);
    //     let vertices = [];
    // let color = [];
    // let geometry = new THREE.BufferGeometry();

    // for (let i = 0; i < 100; i++) {
    //   let x = 117.102442 + Math.random() * 10;
    //   let y = 36.185321 + Math.random() * 10;
    //   var pt = turf.point([x, y]);
    //   var converted = turf.toMercator(pt);
    //   let z = Math.random() * 10 + 999;
    //   vertices.push(converted.geometry.coordinates[0], converted.geometry.coordinates[1], z);
    //   let col = getColorByValue(z);
    //   color.push(col.r, col.g, col.b);
    // }

    // function getColorByValue(value) {
    //   let colors = [
    //     new THREE.Color(`rgb( 113, 196, 54)`),
    //     new THREE.Color(`rgb( 113, 196, 54)`),
    //     new THREE.Color(`rgb( 171, 190, 52)`),
    //     new THREE.Color(`rgb( 201, 155, 52)`),
    //     new THREE.Color(`rgb( 205, 122, 45)`),
    //     new THREE.Color(`rgb( 214, 96, 53)`),
    //     new THREE.Color(`rgb( 234, 57, 45)`),
    //     new THREE.Color(`rgb( 234, 57, 45)`)
    //   ]
    //   let tvalue = Number(value)
    //   if (tvalue < 1) {
    //       return colors[0];
    //   } else if (tvalue <= 5) {
    //       return colors[1];
    //   } else if (tvalue < 15) {
    //       return colors[2];
    //   } else if (tvalue < 30) {
    //       return colors[3];
    //   } else if (tvalue < 50) {
    //       return colors[4];
    //   } else if (tvalue < 80) {
    //       return colors[5];
    //   } else {
    //       return colors[7];
    //   }
    // }
    // geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    // geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));

    // let material = new THREE.LineBasicMaterial({
    //   vertexColors: true,
    // });

    // let lineMesh = new THREE.Line(geometry, material);
    // lineMesh.geometry.verticesNeedUpdate = true;
    // lineMesh.geometry.colorsNeedUpdate = true;

    // lineMesh.scale.set(10000, 10000, 10000);
    // lineMesh.position.y += 10000;
    // lineMesh.rotation.x = Math.PI / 2;
    // var dodecahedronMeshYup_t = new THREE.Group();
    // dodecahedronMeshYup_t.add(lineMesh);
    // this.three.scene.add(lineMesh);

    //     // //将Three.js对象网格分配给我们的对象数组
    var _3DOB = this._3DObject();

    //     // 热力图
    //     const vertexShader = `
    //     varying vec3 vPosition;

    //     void main() {
    //       vPosition = position;
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //     }
    //   `;

    //   const fragmentShader = `
    //   varying vec3 vPosition;

    //   void main() {
    //     float height = vPosition.y / 8.0;
    //     float redHeight = min(max(height * 2.0 - 1.0, 0.0), 1.0);
    //     float greenHeight = min(max((height - 0.5) * 2.0, 0.0), 1.0);
    //     float blueHeight = min(max(1.0 - height * 2.0, 0.0), 1.0);
    //     vec3 color = vec3(redHeight, greenHeight, blueHeight);
    //     gl_FragColor = vec4(color, 1.0);
    //   }
    // `;

    // 生成高度数据的模拟函数
    function generateHeightData(width, height) {
      const data = [];
      for (let i = 0; i < height; i++) {
        data[i] = [];
        for (let j = 0; j < width; j++) {
          data[i][j] = Math.random() * 10;
        }
      }
      return data;
    }
    // 生成高度数据并创建高度热力图网格
    const heightData = generateHeightData(50, 50);
    const geometry_t = new THREE.PlaneBufferGeometry(50, 50, 49, 49);
    const positions = geometry_t.attributes.position.array;
    for (let i = 0, j = 0; i < positions.length; i += 3, j++) {
      const x = Math.floor(j % 50);
      const y = Math.floor(j / 50);
      positions[i + 2] = Math.random() * 10;
    }

    geometry_t.computeVertexNormals(); // 计算顶点法线
    geometry_t.rotateX(-Math.PI / 2); // 将地面平面沿x轴旋转90度
    geometry_t.translate(0, -5, 0); // 将地面平面向下平移5个单位

    // const material = new THREE.ShaderMaterial({
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader
    // });

    const material_t = new THREE.MeshBasicMaterial({
      color: 0xff0000, // 网格颜色
      wireframe: true // 使用线框模式
    });

    // 定义圆形曲线
    const curve = new THREE.EllipseCurve(
      0,
      0, // x, y
      50,
      50, // a, b
      0,
      2 * Math.PI, // thetaStart, thetaLength
      false, // clockwise
      0 // rotation
    );

    const width = 10; // 曲面宽度
    const height = 10; // 曲面高度
    const widthSegments = 20; // 宽度上的网格数量
    const heightSegments = 20; // 高度上的网格数量

    const geometry = new ParametricGeometry(
      (u, v, target) => {
        // define the shape of the geometry using the u and v parameters
        // and set the result in the target vector
        const x = u * width - width / 2;
        const y = v * height - height / 2;
        const z = Math.sin(u * Math.PI * 2) * Math.cos(v * Math.PI * 2);
        target.set(x, y, z);
      },
      widthSegments, // 宽度上的网格数量
      heightSegments // 高度上的网格数量
    );
    geometry.computeVertexNormals(); // 计算顶点法线
    geometry.rotateX(-Math.PI / 2); // 将地面平面沿x轴旋转90度
    // 创建网格对象
    const material2 = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    const dodecahedronMesh_t = new THREE.Mesh(geometry, material_t);

    dodecahedronMesh_t.scale.set(10000, 10000, 10000); //将对象缩放至地球尺度可见
    dodecahedronMesh_t.position.y += 10000; // 在Three.js空间中向上平移，使网格底部成为手柄
    dodecahedronMesh_t.rotation.x = Math.PI / 2; // 旋转网格以适应Cesium的Y-up系统
    var dodecahedronMeshYup_t = new THREE.Group();
    dodecahedronMeshYup_t.add(dodecahedronMesh_t);
    this.three.scene.add(dodecahedronMeshYup_t); // 不要忘记手动将其添加到Three.js场景中

    //将Three.js对象网格分配给我们的对象数组
    _3DOB = this._3DObject();
    _3DOB.threeMesh = dodecahedronMeshYup_t;
    _3DOB.minWGS84 = this.minWGS84;
    _3DOB.maxWGS84 = this.maxWGS84;
    this._3Dobjects.push(_3DOB);

    // 配置Three.js网格以便根据地球中心位置的向上方向进行摆放
    for (const id in this._3Dobjects) {
      this.minWGS84 = this._3Dobjects[id].minWGS84;
      this.maxWGS84 = this._3Dobjects[id].maxWGS84;
      // 将纬度/经度中心位置转换为Cesium.Cartesian3
      const center = Cesium.Cartesian3.fromDegrees((this.minWGS84[0] + this.maxWGS84[0]) / 2, (this.minWGS84[1] + this.maxWGS84[1]) / 2);

      // 获取模型定位的前向方向
      const centerHigh = Cesium.Cartesian3.fromDegrees((this.minWGS84[0] + this.maxWGS84[0]) / 2, (this.minWGS84[1] + this.maxWGS84[1]) / 2, 1);

      // 使用从左下方到左上方的方向作为向上矢量

      // 配置实体位置和方向
      this._3Dobjects[id].threeMesh.position.copy(center);
      this._3Dobjects[id].threeMesh.lookAt(centerHigh.x, centerHigh.y, centerHigh.z);
    }
  },
  /**
   * @地球透明度
   * @param {double} Alpha 透明度
   */
  changeGlobeAlpha: function (Alpha) {
    this.globe.translucency.enabled = Alpha != 1;
    this.globe.translucency.frontFaceAlpha = Alpha == 0 ? 0.1 : Alpha;
    this.globe.translucency.backFaceAlpha = Alpha == 0 ? 0.1 : Alpha;
  },
  /*
   *_3DObject方法返回一个包含threeMesh、minWGS84和maxWGS84属性的对象。
   */
  _3DObject() {
    // this.threeMesh = null //Three.js 3DObject.mesh
    // this.minWGS84 = null //location bounding box
    // this.maxWGS84 = null
    return {
      threeMesh: null,
      minWGS84: null,
      maxWGS84: null
    };
  },
  /**
   * 加载天地图wmts服务
   */
  AddWmts() {
    let _this = this;
    let viewer = _this.viewer;
    //天地图token
    let token = window.tiandituToken;
    //加载在线天地图
    let obj = {
      url: 'http://t0.tianditu.com/cia_w/wmts?tk=' + token,
      label: '天地图影像',
      loadType: 'WebMapTileServiceImageryProvider',
      layer: 'cia',
      style: 'default',
      tileMatrixSetID: 'w',
      format: 'tiles',
      maximumLevel: 18
    };
    var wmtsImageryProvider = new Cesium.WebMapTileServiceImageryProvider(obj);
    viewer.imageryLayers.addImageryProvider(wmtsImageryProvider);
    //        // 获取已加载的影像图层列表
    // var imageryLayers = viewer.imageryLayers;
    // // 遍历影像图层列表
    // for (var i = 0; i < imageryLayers.length; i++) {
    //     var layer = imageryLayers.get(i);
    //     console.log(layer)
    //     // 检查是否是你加载的图层
    //     if (layer.imageryProvider._layer === "cia") {
    //        layer.alpha = 0.3;
    //     }
    // }
  },
  /**
   * 加载XYZ瓦片服务
   */
  AddXyz() {
    let _this = this;
    let viewer = _this.viewer;
    // var osmProvider = new Cesium.UrlTemplateImageryProvider({
    //   url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    // });
    // viewer.imageryLayers.addImageryProvider(osmProvider);
    var imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    });
    viewer.imageryLayers.addImageryProvider(imageryProvider);
  },
  /**
   * 添加数据到球体
   */
  AddDataToEarth: function () {
    let _this = this;
    //_this.removeAll(); //清除已有所有图层
    let token = window.tiandituToken;
    //加载在线天地图
    // _this.AddImageryProvider({
    //   url: "http://t0.tianditu.com/cia_w/wmts?tk=" + token,
    //   label: "天地图影像",
    //   loadType: "WebMapTileServiceImageryProvider",
    //   layer: "cia",
    //   style: "default",
    //   tileMatrixSetID: "w",
    //   format: "tiles",
    //   maximumLevel: 18
    // });
    //自定义球体背景
    const image = new Cesium.SingleTileImageryProvider({
      url: backImg,
      rectangle: Cesium.Rectangle.fromDegrees(-180, -85, 180, 85)
    });
    image._tilingScheme = new Cesium.WebMercatorTilingScheme();
    var imgLayer = this.viewer.scene.imageryLayers.addImageryProvider(image, 10);
    window.backImgIndex = this.viewer.imageryLayers.indexOf(imgLayer);
    this.viewer.scene.imageryLayers.get(window.backImgIndex).show = false;
  },
  /**
   * 添加在线地图到球体
   * @param: obj {Object} 地图服务对象（包含url及属性）
   * @param: index {Number} 图层索引
   */
  AddImageryProvider: function (obj, index) {
    let viewer = this.viewer;
    var loadType = obj.loadType;
    var mapObj = null;
    if (loadType == 'UrlTemplateImageryProvider') {
      mapObj = new Cesium.UrlTemplateImageryProvider(obj);
    } else if (loadType == 'WebMapTileServiceImageryProvider') {
      mapObj = new Cesium.WebMapTileServiceImageryProvider(obj);
    } else if (loadType == 'ArcGisMapServerImageryProvider') {
      mapObj = new Cesium.ArcGisMapServerImageryProvider(obj);
    } else if (loadType == 'MapboxImageryProvider') {
      mapObj = new Cesium.MapboxImageryProvider(obj);
    } else if (loadType == 'BingMapsImageryProvider') {
      mapObj = new Cesium.BingMapsImageryProvider(obj);
    } else if (loadType == 'SingleTileImageryProvider') {
      mapObj = new Cesium.SingleTileImageryProvider(obj);
    } else if (loadType == 'WebMapServiceImageryProvider') {
      mapObj = new Cesium.WebMapServiceImageryProvider(obj);
    } else {
      mapObj = new Cesium.UrlTemplateImageryProvider(obj);
    }
    if (mapObj) {
      mapObj.name = obj.name ? obj.name : '';
      mapObj.id = obj.id ? obj.id : '';
      mapObj.fieldCNNames = obj.fieldCNNames;
      var oneLayer = viewer.scene.imageryLayers.addImageryProvider(mapObj, obj.index);
      oneLayer.alpha = this.TransparencyAlpha;
      if (!this.OnlineMaps[obj.id]) {
        this.OnlineMaps[obj.id] = {
          id: obj.id,
          //通过点线面调整图层显示顺序
          geometryType: obj.geometryType,
          obj: oneLayer,
          url: obj.url,
          isClear: obj.isClear
        };
      }
    }
  },
  /**
   * 向当前视图添加geoserver发布的服务
   * @param: selectedNames {Array} 选中的服务名称
   */
  AddGeoserverService: function (selectedNames) {
    let viewer = this.viewer;
    let _this = this;
    var returnResults = [];
    // 加载图层
    const layerConfigs = [
      {
        layers: 'sanmap:州界面'
      },
      {
        layers: 'sanmap:河流湖泊面'
      },
      // {
      //   layers: "sanmap:郡界线"
      // },
      {
        layers: 'sanmap:河流线'
      },
      {
        layers: 'sanmap:郡治点'
      }
    ];
    const cqlFilterString = selectedNames.map(name => `name='${name}'`).join(' OR ');
    // 服务地址
    let url = 'http://略略:8080/geoserver/sanmap/';
    layerConfigs.forEach(config => {
      const wmsImageryProvider = new Cesium.WebMapServiceImageryProvider({
        url: url + 'wms',
        layers: config.layers,
        parameters: {
          transparent: true,
          format: 'image/png',
          srs: 'EPSG:4326',
          CQL_FILTER: cqlFilterString
        }
      });

      viewer.imageryLayers.addImageryProvider(wmsImageryProvider);
    });
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    // 点击查询
    handler.setInputAction(async function (click) {
      // 清除上一次高亮的entity
      if (viewer.selectedEntity) {
        viewer.entities.remove(viewer.selectedEntity);
      }

      var pickRay = viewer.camera.getPickRay(click.position);
      pickRay.color = Cesium.Color.YELLOW;
      var featuresPromise = await viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene);

      if (featuresPromise[0] != null) {
        returnResults = featuresPromise[0].data.properties;
        console.log(featuresPromise[0]);
        //高亮
        if (featuresPromise[0].data.geometry.type == 'MultiPolygon' || featuresPromise[0].data.geometry.type == 'Polygon' || featuresPromise[0].data.geometry.type == 'MultiLineString') {
          console.log(featuresPromise[0].data.geometry.type);
          returnResults.type = '面';
          _this.viewer.entities.removeAll();
          _this.viewer.entities.add({
            id: 'polygon' + '_点击查询',
            name: '点击面',
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(_this.getDegreesArrayHeights(featuresPromise[0].data, 0)),
              width: 15,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.fromCssColorString('#FF4500')
              }),
              clampToGround: true //是否贴着地表
            },
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(_this.getDegreesArrayHeights(featuresPromise[0].data, 0))),
              material: Cesium.Color.RED.withAlpha(1.0), // 更加高亮的红色，并有一定透明度
              classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
            }
          });
        } else if (featuresPromise[0].data.geometry.type == 'Point') {
          _this.viewer.entities.removeAll();
          returnResults.type = '点';
          _this.viewer.entities.add({
            id: 'point' + '_点击查询',
            name: '点击点',
            position: Cesium.Cartesian3.fromDegrees(_this.getDegreesArrayHeights(featuresPromise[0].data, 0)[0], _this.getDegreesArrayHeights(featuresPromise[0].data, 0)[1], 0),
            point: {
              color: Cesium.Color.FUCHSIA, //修改颜色
              pixelSize: 15,
              disableDepthTestDistance: 5000000
            }
          });
        }
      }

      // 传值
      Vue.prototype.$bus.$emit('cesium-to-card', returnResults);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 销毁鼠标监听
    handler.setInputAction(function (click) {
      handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    //    // 获取已加载的影像图层列表
    // var imageryLayers = viewer.imageryLayers;
    // // 遍历影像图层列表
    // for (var i = 0; i < imageryLayers.length; i++) {
    //     var layer = imageryLayers.get(i);
    //     // 检查是否是你加载的图层
    //     if (layer.imageryProvider.layers === "sanmap:州界面") {
    //        layer.alpha = 0.3;
    //     }
    // }
  },
  //坐标转换函数（将传入的地理特性的坐标转换为Cesium库所需的格式）
  getDegreesArrayHeights(feature, height) {
    let newHeight = height;
    let degreesArrayHeights = [];
    let coordinates;
    if (feature.geometry.type == 'MultiPolygon') {
      coordinates = feature.geometry.coordinates[0][0];
      //坐标串转为需要的格式[x,y,z,x,y,z....]
      for (let i = 0; i < coordinates.length; i++) {
        const element = coordinates[i];
        degreesArrayHeights.push(element[0]);
        degreesArrayHeights.push(element[1]);
        degreesArrayHeights.push(newHeight);
      }
    } else if (feature.geometry.type == 'Polygon') {
      coordinates = feature.geometry.coordinates[0];
      //坐标串转为需要的格式[x,y,z,x,y,z....]
      for (let i = 0; i < coordinates.length; i++) {
        const element = coordinates[i];
        degreesArrayHeights.push(element[0]);
        degreesArrayHeights.push(element[1]);
        degreesArrayHeights.push(newHeight);
      }
    } else if (feature.geometry.type == 'MultiLineString') {
      coordinates = feature.geometry.coordinates[0];
      //坐标串转为需要的格式[x,y,z,x,y,z....]
      for (let i = 0; i < coordinates.length; i++) {
        const element = coordinates[i];
        degreesArrayHeights.push(element[0]);
        degreesArrayHeights.push(element[1]);
        degreesArrayHeights.push(newHeight);
      }
    } else if (feature.geometry.type == 'Point') {
      degreesArrayHeights.push(feature.geometry.coordinates[0]);
      degreesArrayHeights.push(feature.geometry.coordinates[1]);
      degreesArrayHeights.push(newHeight);
    }
    return degreesArrayHeights;
  },
  /**
   * 添加大雁塔模型
   */
  Add3DTileset() {
    let _this = this;
    let viewer = _this.viewer;

    let tileSetModel = new Cesium.Cesium3DTileset({
      url: '../static/3DT/dayanta/tileset.json'
    });

    // 加载3D瓦片集模型
    tileSetModel.readyPromise
      .then(tileset => {
        // 将3D瓦片集的边界球中心转换为地理坐标
        let cartographicCenter = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);

        // 使用sampleTerrainMostDetailed函数获取边界球中心的地形高度
        Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographicCenter]).then(function (samples) {
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
      .catch(function (error) {
        console.log(error);
      });
  },
  /**
   * 添加三维模型
   * @param: style {Boolean} 是否加载渐变和动态光环
   */
  AddCesium3DTileset2: function (style) {
    let viewer = this.viewer;
    //模型加载
    const tileset = viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(75343)
      })
    );
    // style为true时，加载渐变和动态光环，否则为白模
    if (style) {
      // 建筑物渐变和动态光环
      tileset.tileVisible.addEventListener(function (tile) {
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
    }

    //设置模型的样式
    //   var heightStyle = new Cesium.Cesium3DTileStyle({
    //     color: {
    //       // conditions : [
    //       //     ["${Height} >= 300", "rgba(45, 0, 75, 0.5)"],
    //       //     ["${Height} >= 200", "rgb(102, 71, 151)"],
    //       //     ["${Height} >= 100", "rgb(170, 162, 204)"],
    //       //     ["${Height} >= 50", "rgb(224, 226, 238)"],
    //       //     ["${Height} >= 25", "rgb(252, 230, 200)"],
    //       //     ["${Height} >= 10", "rgb(248, 176, 87)"],
    //       //     ["${Height} >= 5", "rgb(198, 106, 11)"],
    //       //     ["true", "rgb(255,255,255)"]
    //       // ]
    //       conditions: [["true", "color('rgb(51, 153, 255)',1)"]]
    //     }
    //   });
    //   tileset.style = heightStyle;
    //   // Adjust the tileset height so its not floating above terrain
    //   var heightOffset = -32;
    //   tileset.readyPromise.then(function(tileset) {
    //     // Position tileset
    //     var boundingSphere = tileset.boundingSphere;
    //     var cartographic = Cesium.Cartographic.fromCartesian(
    //       boundingSphere.center
    //     );
    //     var surface = Cesium.Cartesian3.fromRadians(
    //       cartographic.longitude,
    //       cartographic.latitude,
    //       0.0
    //     );
    //     var offset = Cesium.Cartesian3.fromRadians(
    //       cartographic.longitude,
    //       cartographic.latitude,
    //       heightOffset
    //     );
    //     var translation = Cesium.Cartesian3.subtract(
    //       offset,
    //       surface,
    //       new Cesium.Cartesian3()
    //     );
    //     tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    //   });
    //   var customShader = new Cesium.CustomShader({
    //     lightingModel: Cesium.LightingModel.UNLIT,
    //     fragmentShaderText: `
    // void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
    //     float _baseHeight = 0.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
    //     float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _      heightRange) 默认是 0-60米
    //     float _glowRange = 300.0; // 光环的移动范围(高度)
    //       float vtxf_height = fsInput.attributes.positionMC.z-_baseHeight;
    //       float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
    //       float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
    //       material.diffuse*= vec3(vtxf_a12, vtxf_a12, vtxf_a12);
    //       float vtxf_a13 = fract(czm_frameNumber / 360.0);
    //       float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
    //       vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
    //       float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
    //       material.diffuse += material.diffuse * (1.0 - vtxf_diff);
    //   }
    //   `
    //   });
    //   tileset.customShader = customShader;

    viewer.camera.setView({
      destination: new Cesium.Cartesian3(1332761, -4662399, 4137888),
      orientation: {
        heading: 0.6,
        pitch: -0.66
      }
    });

    // 聚焦
    // viewer.zoomTo(tileset);

    // 3d tiles调试面板
    // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

    // 单击高亮元素
    // const hightLighted = {
    //   feautre: undefined,
    //   originalColor: new Cesium.Color()
    // };
    // viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(event) {
    //   // 清除之前的高亮元素
    //   if (Cesium.defined(hightLighted.feature)) {
    //     hightLighted.feature.color = hightLighted.originalColor;
    //     hightLighted.feature = undefined;
    //   }

    //   // 选择新要素
    //   const pickedFeature = viewer.scene.pick(event.position);
    //   if (!Cesium.defined(pickedFeature)) {
    //     return;
    //   }

    //   // 存储选中要素的信息
    //   hightLighted.feature = pickedFeature;
    //   Cesium.Color.clone(pickedFeature.color, hightLighted.originalColor);
    //   // 高亮选中元素
    //   pickedFeature.color = Cesium.Color.YELLOW;
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 获取3D tiles中所有feature数据信息
    // tileset.tileLoad.addEventListener(function(tile) {
    //   let content = tile.content;
    //   let featuresLength = content.featuresLength;
    //   console.log("要素数量为：");
    //   console.log(featuresLength);
    //   console.log("第一个要素为：");
    //   let feature = content.getFeature(0);
    //   console.log(feature);
    // })

    // 获取当前可视范围内3D tiles的feature数量
    // 瓦片内容
    // let content = undefined;
    // // 设置瓦片加载完成监听事件
    // tileset.tileLoad.addEventListener(function(tile) {
    //   content = tile.content;
    // });
    // // 监听相机移动事件
    // viewer.camera.moveEnd.addEventListener(() => {
    //   try {
    //     // 计算当前可视范围矩形
    //     let viewRectangle = viewer.camera.computeViewRectangle();
    //     // 遍历所有要素
    //     let featuresLength = content.featuresLength;
    //     let count = 0;
    //     for (let i = 0; i < featuresLength; i++) {
    //       let feature = content.getFeature(i);
    //       let lon = feature.getProperty("Longitude");
    //       let lat = feature.getProperty("Latitude");

    //       let centerCartographic = new Cesium.Cartographic(
    //         Cesium.Math.toRadians(Number(lon)),
    //         Cesium.Math.toRadians(Number(lat))
    //       );
    //       // 要素中心点与当前可视范围做包含判断
    //       if (Cesium.Rectangle.contains(viewRectangle, centerCartographic)) {
    //         count++;
    //       }
    //     }
    //     // 输出
    //     console.log("当前可视范围内的要素数量为:" + count);
    //   } catch (e) {
    //     console.log("无法获取:" + e);
    //   }
    // });

    // 调整3d tiles离地高度
    // 判断加载完成
    // tileset.readyPromise.then(tileset => {
    //   viewer.scene.primitives.add(tileset);

    //   // 将3d tiles离地高度抬升100米
    //   let cartographic = Cesium.Cartographic.fromCartesian(
    //     tileset.boundingSphere.center
    //   );

    //   let surface = Cesium.Cartesian3.fromRadians(
    //     cartographic.longitude,
    //     cartographic.latitude,
    //     0.0
    //   );

    //   let offset = Cesium.Cartesian3.fromRadians(
    //     cartographic.longitude,
    //     cartographic.latitude,
    //     100.0
    //   );

    //   let translation = Cesium.Cartesian3.subtract(
    //     offset,
    //     surface,
    //     new Cesium.Cartesian3()
    //   );

    //   tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    // });
  },
  AddCesium3DTileset: function (style) {
    let viewer = this.viewer;
    //模型加载
    const tileset = viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: '../static/3DT/down/up/tileset.json'
      })
    );
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: `color('rgba(0, 76, 153, 0.8)')`
    });

    tileset.tileVisible.addEventListener(function (tile) {
      let content = tile.content;
      let featuresLength = content.featuresLength;
      for (let i = 0; i < featuresLength; i++) {
        let feature = content.getFeature(i);
        let model = feature.content._model;
        if (model && model._pipelineResources) {
          let program = model._pipelineResources[1];
          program._fragmentShaderSource.sources[0] = `
        varying vec3 v_positionEC;
          void main(void){
            vec4 position = czm_inverseModelView * vec4(v_positionEC,1); // 位置
            gl_FragColor = vec4(0.0, 0.3, 0.8, 0.6); // 蓝颜色
           
            // 高于1米的部分，显示黄颜色
            if(position.y >1.0) {
              gl_FragColor = vec4(1.0, 1.0, 0.0, 0.9);
            }
          }
        `;
        }
      }
    });

    var tileModelTool = {
      scale: 100.0,
      longitude: 113.336648,
      latitude: 29.634265,
      height: 0, //修改高度
      rx: 0,
      ry: 0,
      rz: 33.5, //修改旋转
      alpha: 0.5
    };
    viewer.camera.frustum.far = 1e8; // 增大远裁剪平面
    tileset.readyPromise.then(tileset => {
      var mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(tileModelTool.rx));
      var my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(tileModelTool.ry));
      var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(tileModelTool.rz));
      var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
      var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
      var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
      //平移 修改经纬度
      var position = Cesium.Cartesian3.fromDegrees(tileModelTool.longitude, tileModelTool.latitude, tileModelTool.height);
      var m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      //旋转、平移矩阵相乘
      Cesium.Matrix4.multiply(m, rotationX, m);
      Cesium.Matrix4.multiply(m, rotationY, m);
      Cesium.Matrix4.multiply(m, rotationZ, m);
      //缩放 修改缩放比例
      var scale = Cesium.Matrix4.fromUniformScale(tileModelTool.scale);
      Cesium.Matrix4.multiply(m, scale, m);
      //赋值给tileset
      tileset._root.transform = m;

      //     let boundingSphere = tileset.boundingSphere;
      //     let center = boundingSphere.center;
      //     // 将原始模型中心点的笛卡尔坐标转换为地理坐标
      //     let cartographic = Cesium.Cartographic.fromCartesian(center);
      //     // 目标位置的地理坐标
      //     let targetLongitude = Cesium.Math.toRadians(116.46);
      //     let targetLatitude = Cesium.Math.toRadians(36.92);
      //     let targetHeight = 0;
      //     // 计算偏移量
      //     let offset = new Cesium.Cartesian3();
      //     Cesium.Cartesian3.subtract(
      //         Cesium.Cartesian3.fromRadians(targetLongitude, targetLatitude, targetHeight),
      //         Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height),
      //         offset
      //     );
      // // 将笛卡尔坐标转换为地理坐标
      // let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      // let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      // let height = cartographic.height;
      // console.log('模型的默认位置：经度=' + longitude + ', 纬度=' + latitude + ', 高度=' + height);
      //   // 创建平移矩阵并设置为模型矩阵
      // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(offset);
    });
    // 聚焦
    viewer.zoomTo(tileset);
    viewer.scene.screenSpaceCameraController.enableLook = false;

    //单击高亮元素
    // const hightLighted = {
    //   feautre: undefined,
    //   originalColor: new Cesium.Color()
    // };
    // viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(event) {
    //       // 清除之前的高亮元素
    //   if (Cesium.defined(hightLighted.feature)) {
    //     hightLighted.feature.color = hightLighted.originalColor;
    //     hightLighted.feature = undefined;
    //   }

    //   // 选择新要素
    //   const pickedFeature = viewer.scene.pick(event.position);
    //   if (!Cesium.defined(pickedFeature)) {
    //     return;
    //   }

    //   // 存储选中要素的信息
    //   hightLighted.feature = pickedFeature;
    //   Cesium.Color.clone(pickedFeature.color, hightLighted.originalColor);
    //   // 高亮选中元素
    //   pickedFeature.color = Cesium.Color.YELLOW;
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // // 获取单击的元素

    // 获取3D tiles中所有feature数据信息
    // tileset.tileLoad.addEventListener(function(tile) {
    //   let content = tile.content;
    //   let featuresLength = content.featuresLength;
    //   console.log("要素数量为：");
    //   console.log(featuresLength);
    //   console.log("第一个要素为：");
    //   let feature = content.getFeature(0);
    //   console.log(feature);
    //   for(let i=0;i<featuresLength;i++){
    //     let feature_i = content.getFeature(i);
    //     console.log( feature_i.color)
    //     feature_i.color = Cesium.Color.RED;
    //     console.log( feature_i.color)
    //   }
    // })
  },
  /**
   * 添加故宫geojson数据
   */
  AddGuGong() {
    var viewer = this.viewer;
    Cesium.GeoJsonDataSource.load('../static/geojson/故宫.geojson')
      .then(function (data) {
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
  },
  /**
   * 添加山东省边界kml数据
   */
  AddKml() {
    var viewer = this.viewer;
    viewer.dataSources.add(Cesium.KmlDataSource.load('../static/山东省边界.kml')).then(function (dataSource) {});
  },
  /**
   * 添加卫星轨迹czml数据
   */
  AddCzml() {
    var viewer = this.viewer;
    viewer.dataSources.add(Cesium.CzmlDataSource.load('../static/卫星轨迹.czml')).then(function (dataSource) {});
  },
  /**
   * 添加glb模型（键盘控制移动）
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {Number} z 高度
   */
  AddCesiumglb(x, y, z) {
    var viewer = this.viewer;
    let url = '../static/boat.glb';
    // 模型姿态变化
    let headingPitchRoll = new Cesium.HeadingPitchRoll();
    // 模型初始位置
    let position2 = new Cesium.Cartesian3.fromDegrees(x, y, z);
    // 局部变换坐标系
    let fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west');
    // 每次操作姿态变化为5°
    let deltaRadians = Cesium.Math.toRadians(5.0);
    // 速度
    let speed = 10;
    // 速度向量
    let speedVector = new Cesium.Cartesian3();

    // 添加实体
    // 使用primitive方式加载模型
    const modelEntity = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url: url,
        scale: 20.0,
        modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(position2, headingPitchRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform),
        minimumPixelSize: 12,
        maximumScale: 200
      })
    );
    // 设置模型名称
    modelEntity.name = '飞机模型';
    // 添加键盘监听事件
    document.addEventListener('keydown', function (e) {
      switch (e.keyCode) {
        // 抬头
        case 38:
          headingPitchRoll.pitch += deltaRadians;
          // 判断是否超过2π范围
          if (headingPitchRoll.pitch > Cesium.Math.TWO_PI) {
            headingPitchRoll.pitch -= Cesium.Math.TWO_PI;
          }
          console.log('抬头：pitch+');
          // // 获取已加载的3D模型列表
          // var primitives = viewer.scene.primitives;

          // for (var i = 0; i < primitives.length; i++) {
          //   var primitive = primitives.get(i);

          //   // 判断是否为3D模型（glTF）
          //   if (primitive instanceof Cesium.Model&&primitive.name=="飞机模型") {
          //     console.log(primitive)
          //     primitive.color = new Cesium.Color(1.0, 0.0, 0.0, 1.0);
          //   }
          // }
          break;

        // 低头
        case 40:
          headingPitchRoll.pitch -= deltaRadians;
          if (headingPitchRoll.pitch < -Cesium.Math.TWO_PI) {
            headingPitchRoll.pitch += Cesium.Math.TWO_PI;
          }
          console.log('低头：pitch-');

          break;

        // 左转
        case 37:
          headingPitchRoll.heading -= deltaRadians;
          // 判断是否超过2π范围
          if (headingPitchRoll.heading < -Cesium.Math.TWO_PI) {
            headingPitchRoll.heading += Cesium.Math.TWO_PI;
          }
          console.log('左转：heading+');
          break;

        // 右转
        case 39:
          headingPitchRoll.heading += deltaRadians;
          // 判断是否超过2π范围
          if (headingPitchRoll.heading > Cesium.Math.TWO_PI) {
            headingPitchRoll.heading -= Cesium.Math.TWO_PI;
          }
          console.log('右转：heading-');
          break;

        // 顺时针
        case 96:
          headingPitchRoll.roll += deltaRadians;
          // 判断是否超过2π范围
          if (headingPitchRoll.roll > Cesium.Math.TWO_PI) {
            headingPitchRoll.roll -= Cesium.Math.TWO_PI;
          }
          console.log('顺时针翻滚：roll+');
          break;

        // 逆时针
        case 110:
          headingPitchRoll.roll -= deltaRadians;
          // 判断是否超过2π范围
          if (headingPitchRoll.roll < -Cesium.Math.TWO_PI) {
            headingPitchRoll.roll += Cesium.Math.TWO_PI;
          }
          console.log('逆时针翻滚：roll-');
          break;

        // 加速
        case 187:
          speed += 10;
          speed = Math.min(speed, 10000);
          console.log('加速:' + speed);
          break;
        // 减速
        case 189:
          speed -= 10;
          speed = Math.max(speed, 100);
          console.log('减速:' + speed);
          break;

        default:
          break;
      }
    });

    // 渲染更新前阶段添加监听
    viewer.scene.preUpdate.addEventListener(() => {
      if (window.fly) {
        speedVector = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_X, speed / 10, speedVector);
        position2 = Cesium.Matrix4.multiplyByPoint(modelEntity.modelMatrix, speedVector, position2);
        // 更新模型姿态与位置
        Cesium.Transforms.headingPitchRollToFixedFrame(position2, headingPitchRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform, modelEntity.modelMatrix);
        // 俯视跟随
        viewer.camera.lookAt(position2, new Cesium.Cartesian3(0, 0, 2000));
        // 第一视角跟随
        //viewer.camera.lookAt(position2, new Cesium.HeadingPitchRange(headingPitchRoll.heading, headingPitchRoll.pitch, 2000))
      }
    });
  },
  /**
   * 添加glb模型（轨迹移动）
   * @param {Array} data 轨迹坐标数组
   */
  TrajectoryMovement(data) {
    var viewer = this.viewer;
    let url = '../static/Cesium_Man.glb';
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
  },
  /**
   * 移除所有图层
   */
  RemoveAll: function () {
    if (this.viewer && this.viewer.imageryLayers) {
      this.viewer.imageryLayers.removeAll();
    }
    this.OnlineMaps = {}; //在线地图
  },
  /**
   * 飞行到中国范围
   */
  FlyToChina: function () {
    this.viewer.scene.camera.setView({
      destination: new Cesium.Cartesian3.fromDegrees(117.002743, 33.638562, 25030800),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0), // 从上往下看为-90
        roll: 0
      }
    });
  },
  /**
   * 飞行到指定位置
   * @param {Object} viewer    视图
   * @param {Object} position  位置
   * @param {Number} duration  持续时间
   */
  FlyTo: function (viewer, position, duration) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.height),
      duration: duration //持续时间
    });
  },
  /**
   * 鼠标滑动坐标
   */
  Show3DCoordinates: function () {
    let _this = this;
    let viewer = this.viewer;
    let handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler3D.setInputAction(function (movement) {
      let pick = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);
      if (pick) {
        let cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
        if (cartesian) {
          // 世界坐标转地理坐标（弧度）
          let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
          if (cartographic) {
            // 海拔
            let height = viewer.scene.globe.getHeight(cartographic);
            // 视角海拔高度
            let he = Math.sqrt(viewer.scene.camera.positionWC.x * viewer.scene.camera.positionWC.x + viewer.scene.camera.positionWC.y * viewer.scene.camera.positionWC.y + viewer.scene.camera.positionWC.z * viewer.scene.camera.positionWC.z);
            let he2 = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
            // 地理坐标（弧度）转经纬度坐标
            let point = [(cartographic.longitude / Math.PI) * 180, (cartographic.latitude / Math.PI) * 180];
            if (!height) {
              height = 0;
            }
            if (!he) {
              he = 0;
            }
            if (!he2) {
              he2 = 0;
            }
            if (!point) {
              point = [0, 0];
            }
            let cameraData = _this.GetCameraData();
            let cameracontent = '相机坐标:(' + cameraData.X + ',' + cameraData.Y + ',' + cameraData.Z + ') ,H:' + cameraData.heading.toFixed(2) + ',' + 'P:' + cameraData.pitch.toFixed(2) + ',' + 'R:' + cameraData.roll.toFixed(2);
            let content = '视角海拔高度:' + (he - he2).toFixed(2) + '米' + '  海拔:' + height.toFixed(2) + '米' + '  经度:' + point[0].toFixed(6) + ' 纬度:' + point[1].toFixed(6);
            content += '  ' + cameracontent;
            let contentArray = {
              视角海拔高度: he - he2,
              海拔: height,
              经度: point[0],
              纬度: point[1],
              相机坐标: [cameraData.X, cameraData.Y, cameraData.Z],
              相机方位: [cameraData.heading, cameraData.pitch, cameraData.roll]
            };
            return content, contentArray;
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  },
  /**
   * 拾取当前地图点击位置坐标
   */
  GetClickPointAdd() {
    let viewer = this.viewer;
    // 注册屏幕点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      // 转换为不包含地形的笛卡尔坐标
      let clickPosition = viewer.scene.camera.pickEllipsoid(event.position);
      console.log(clickPosition);
      // 转经纬度（弧度）坐标
      let radiansPos = Cesium.Cartographic.fromCartesian(clickPosition);
      // 转角度
      console.log('经度：' + Cesium.Math.toDegrees(radiansPos.longitude) + ', 纬度：' + Cesium.Math.toDegrees(radiansPos.latitude));

      // 添加点
      viewer.entities.add({
        position: clickPosition,
        point: {
          color: Cesium.Color.YELLOW,
          pixelSize: 30
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  /**
   * 获得当前相机姿态及方位信息
   */
  GetCameraData() {
    var viewer = this.viewer;
    var dircartographic = viewer.scene.camera.positionCartographic;
    //相机姿态
    //角度转弧度：let radians=Cesium.Math.toRadians(degrees)
    //弧度转角度：let degrees=Cesium.Math.toDegrees(radians)
    var camerax = Cesium.Math.toDegrees(dircartographic.longitude).toFixed(6);
    var cameray = Cesium.Math.toDegrees(dircartographic.latitude).toFixed(6);
    var cameraz = dircartographic.height.toFixed(2);
    //相机方位
    var heading = Cesium.Math.toDegrees(viewer.scene.camera.heading);
    var pitch = Cesium.Math.toDegrees(viewer.scene.camera.pitch);
    var roll = Cesium.Math.toDegrees(viewer.scene.camera.roll);
    return {
      X: parseFloat(camerax),
      Y: parseFloat(cameray),
      Z: parseFloat(cameraz),
      heading: heading, //默认方向为正北，正角度为向东旋转，即水平旋转，也叫偏航角。值越大代表相机向右看的角度越大，值越小代表相机向左看的角度越大。
      pitch: pitch, //默认角度为-90，即朝向地面，正角度在平面之上，负角度为平面下，即上下旋转，也叫俯仰角。值越大代表相机向下看的角度越小
      roll: roll //默认旋转角度为0，左右旋转，正角度向右，负角度向左，也叫翻滚角。值越大代表相机向右倾斜的角度越大。
    };
  },
  /**
   * 获取当前地图瓦片级别
   */
  TileLevel: function () {
    let viewer = this.viewer;
    // 注册鼠标滚轮事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let tiles = new Set();
      let tilesToRender = viewer.scene.globe._surface._tilesToRender;
      if (Cesium.defined(tilesToRender)) {
        for (let i = 0; i < tilesToRender.length; i++) {
          tiles.add(tilesToRender[i].level);
        }
        console.log('当前地图瓦片级别为:');
        console.log(tiles);
      }
    }, Cesium.ScreenSpaceEventType.WHEEL);
  },
  /**
   * 获取当前地图可视范围矩形
   */
  RefreshViewRectangle: function () {
    let viewer = this.viewer;
    viewer.camera.moveEnd.addEventListener(() => {
      let rectangle = viewer.camera.computeViewRectangle();
      console.log('当前可视范围矩形为：');
      console.log(rectangle);
    });
  },
  /**
   * 获取当前地图中心的经纬度
   * @returns {{lon: number, lat: number}} 经纬度
   */
  GetCenterPosition() {
    let viewer = this.viewer;
    let centerResult = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2));
    let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerResult);
    let curLongitude = (curPosition.longitude * 180) / Math.PI;
    let curLatitude = (curPosition.latitude * 180) / Math.PI;
    return {
      lon: curLongitude,
      lat: curLatitude
    };
  },
  /*三维空间测量*/
  /**
   * 贴地/不贴地
   */
  ClampToGround: function () {
    if (this.clampToGround == false) {
      this.clampToGround = true;
    } else {
      this.clampToGround = false;
    }
  },
  /**
   * 空间距离测量
   */
  SpaceDistance: function () {
    this.measure.drawLineMeasureGraphics({
      clampToGround: this.clampToGround,
      callback: () => {
        console.log(1);
      }
    });
  },
  /**
   * 空间面积测量
   */
  SpaceArea: function () {
    let viewer = this.viewer;
    this.measure.drawAreaMeasureGraphics({
      clampToGround: this.clampToGround,
      callback: res => {
        console.log(res);
      }
    });
  },
  /**
   * 三角量测
   */
  Triangulation: function () {
    this.measure.drawTrianglesMeasureGraphics({
      callback: () => {}
    });
  },
  /**
   * 清除测量
   */
  ClearanceMeasurement: function () {
    this.measure._drawLayer.entities.removeAll();
  },
  /**
   * 鹰眼图
   */
  Eye() {
    // 初始化地图
    this._hawkEyeMap = new Cesium.Viewer('eye', {
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false
    });
    this._hawkEyeMap.cesiumWidget.creditContainer.style.display = 'none';
    this._hawkEyeMap.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    this._hawkEyeMap.imageryLayers.removeAll();

    // 鹰眼图中添加高德路网中文注记图（鹰眼图中坐标偏移一点不影响）
    this._hawkEyeMap.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18
      })
    );

    // 引起事件监听的相机变化幅度
    this.viewer.camera.percentageChanged = 0.02;
    this._hawkEyeMap.camera.percentageChanged = 0.5;

    this._bindEvent();
  },
  /**
   * 鹰眼图绑定事件
   */
  _bindEvent() {
    // 鹰眼与主图同步
    this.viewer.camera.changed.addEventListener(this._syncEyeMap, this);
    // 第一次刷新渲染时联动
    this.viewer.scene.preRender.addEventListener(this._syncEyeMap, this);

    // 主图与鹰眼图同步
    this._hawkEyeMap.camera.changed.addEventListener(this._syncMap, this);
    this._hawkEyeMap.scene.preRender.addEventListener(this._syncMap, this);
  },
  /**
   * 同步主图与鹰眼地图
   */
  _syncEyeMap() {
    // 监听主图
    new Cesium.ScreenSpaceEventHandler(this.viewer.canvas).setInputAction(() => {
      this._isMainMapTrigger = true;
      this._isEyeMapTrigger = false;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 判断是否为主图移动
    if (!this._isMainMapTrigger) {
      return false;
    }
    this._hawkEyeMap.camera.flyTo({
      destination: this.viewer.camera.position,
      orientation: {
        heading: this.viewer.camera.heading,
        pitch: this.viewer.camera.pitch,
        roll: this.viewer.camera.roll
      },
      duration: 0.0
    });
  },
  /**
   * 鹰眼地图与主图联动效果
   */
  _syncMap() {
    // 监听鹰眼地图
    new Cesium.ScreenSpaceEventHandler(this._hawkEyeMap.canvas).setInputAction(() => {
      this._isMainMapTrigger = false;
      this._isEyeMapTrigger = true;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // 判断是否为鹰眼地图移动
    if (!this._isEyeMapTrigger) {
      return false;
    }
    this.viewer.camera.flyTo({
      destination: this._hawkEyeMap.camera.position,
      orientation: {
        heading: this._hawkEyeMap.camera.heading,
        pitch: this._hawkEyeMap.camera.pitch,
        roll: this._hawkEyeMap.camera.roll
      },
      duration: 0.0
    });
  },
  /**
   * 场景导出为图片
   */
  SaveToImage() {
    let viewer = this.viewer;
    // 不写会导出为黑图
    viewer.render();

    let canvas = viewer.scene.canvas;
    let image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

    let link = document.createElement('a');
    let blob = this.DataURLtoBlob(image);
    let objurl = URL.createObjectURL(blob);
    link.download = 'scene.png';
    link.href = objurl;
    link.click();
  },
  /**
   * 将base64转换为blob
   * @param {String} dataurl  base64字符串
   * @returns {Blob}          blob对象
   */
  DataURLtoBlob(dataurl) {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
      type: mime
    });
  },
  /**
   * 开始场景旋转
   */
  StartRotate() {
    this.viewer.clock.shouldAnimate = true;
    this.Rotate_unbindEvent();
    this.Rotate_bindEvent();
  },
  /**
   * 停止场景旋转
   */
  StopRotate() {
    this.viewer.clock.shouldAnimate = false;
    this.Rotate_unbindEvent();
  },
  /**
   * 解绑事件（解绑事件后，相机不会绕地旋转）
   */
  Rotate_unbindEvent() {
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    this.viewer.clock.onTick.removeEventListener(this._aroundView, this);
  },
  /**
   * 绑定事件（绑定事件后，相机会绕地旋转）
   */
  Rotate_bindEvent() {
    this.viewer.clock.onTick.addEventListener(this._aroundView, this);
  },
  /**
   * 相机绕地旋转函数
   */
  _aroundView() {
    let heading = this.viewer.camera.heading;
    let pitch = this.viewer.camera.pitch;
    let roll = this.viewer.camera.roll;
    heading += Cesium.Math.toRadians(2);
    if (heading >= Math.PI * 2 || heading <= -Math.PI * 2) {
      heading = 0;
    }
    this.viewer.camera.setView({
      orientation: {
        heading: heading,
        pitch: pitch,
        roll: roll
      }
    });
  },
  /**
   * 开始地球自转
   */
  StartGlobeRotate() {
    this.viewer.clock.shouldAnimate = true;
    this.GlobeRotate_unbindEvent();
    this.GlobeRotate_bindEvent();
  },
  /**
   * 停止地球自转
   */
  StopGlobeRotate() {
    this.viewer.clock.shouldAnimate = false;
    this.GlobeRotate_unbindEvent();
  },
  /**
   * 绑定事件（地球自转）
   */
  GlobeRotate_bindEvent() {
    // 转动的速度设置
    this.viewer.clock.multiplier = 15 * 1000;
    // 初始化为单位矩阵
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    this.viewer.scene.postUpdate.addEventListener(this._icrf, this);
  },
  /**
   * 解绑事件（地球自转）
   */
  GlobeRotate_unbindEvent() {
    this.viewer.clock.multiplier = 1;
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    this.viewer.scene.postUpdate.removeEventListener(this._icrf, this);
  },
  /**
   * 地球自转函数
   */
  _icrf() {
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return ture;
    }
    let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(this.viewer.clock.currentTime);
    if (icrfToFixed) {
      let camera = this.viewer.camera;
      let offset = Cesium.Cartesian3.clone(camera.position);
      let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
      // 偏移相机，否则会场景旋转而地球不转
      camera.lookAtTransform(transform, offset);
    }
  },
  /**
   * 多彩矩形地球（使用随机颜色）
   */
  InitColorfulRectEarth() {
    let instances = [];
    for (let lon = -180.0; lon < 180.0; lon += 5.0) {
      for (let lat = -90.0; lat < 90.0; lat += 5.0) {
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(lon, lat, lon + 5.0, lat + 5.0)
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5
                })
              )
            }
          })
        );
      }
    }
    this.react = this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PerInstanceColorAppearance()
      })
    );
  },
  /**
   * 雪天效果
   */
  SnowEffect() {
    var viewer = this.viewer;
    let option = {
      snowSize: 0.01, // 雪花大小，值越大雪花越大 最好不要超过0.01
      snowSpeed: 60 // 雪花速度，值越大雪花越慢
    };
    this.snowStage = new Cesium.PostProcessStage({
      name: 'czm_snow',
      fragmentShader: this.Snow(),
      uniforms: {
        snowSize: () => {
          return option.snowSize;
        },
        snowSpeed: () => {
          return option.snowSpeed;
        }
      }
    });
    viewer.scene.postProcessStages.add(this.snowStage);
  },
  /**
   * 雪天效果着色器
   * @returns {string} 着色器
   */
  Snow() {
    return 'uniform sampler2D colorTexture;\n\
    varying vec2 v_textureCoordinates;\n\
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
        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
        \n\
    }\n\
    ';
  },
  /**
   * 雨天效果
   */
  RainEffect() {
    var viewer = this.viewer;
    let option = {
      tiltAngle: -0.1, //倾斜角度，负数向右，正数向左
      rainSize: 0.6, // 雨大小
      rainSpeed: 120.0 // 雨速
    };
    this.rainStage = new Cesium.PostProcessStage({
      name: 'czm_rain',
      fragmentShader: this.Rain(),
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
    viewer.scene.postProcessStages.add(this.rainStage);
  },
  /**
   * 雨天效果着色器
   * @returns {string} 着色器
   */
  Rain() {
    return 'uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
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
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
            }\n\
            ';
  },
  /**
   * 雾天效果
   */
  FogEffect() {
    var viewer = this.viewer;
    let option = {
      visibility: 0.2,
      color: new Cesium.Color(0.8, 0.8, 0.8, 0.3)
    };
    this.fogStage = new Cesium.PostProcessStage({
      name: 'czm_fog',
      fragmentShader: this.Fog(),
      uniforms: {
        visibility: () => {
          return option.visibility;
        },
        fogColor: () => {
          return option.color;
        }
      }
    });
    viewer.scene.postProcessStages.add(this.fogStage);
  },
  /**
   * 雾天效果着色器
   * @returns {string} 着色器
   */
  Fog() {
    return 'uniform sampler2D colorTexture;\n\
     uniform sampler2D depthTexture;\n\
     uniform float visibility;\n\
     uniform vec4 fogColor;\n\
     varying vec2 v_textureCoordinates; \n\
     void main(void) \n\
     { \n\
        vec4 origcolor = texture2D(colorTexture, v_textureCoordinates); \n\
        float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
        vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates); \n\
        float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
        if (f < 0.0) f = 0.0; \n\
        else if (f > 1.0) f = 1.0; \n\
        gl_FragColor = mix(origcolor, fogColor, f); \n\
     }\n';
  },
  /**
   * 昼夜交替
   */
  UpdateLighting() {
    var viewer = this.viewer;
    // 启用光照
    viewer.scene.globe.enableLighting = true;
    viewer.shadows = true;
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 5000;
  },
  /**
   * 分屏
   */
  Split() {
    var viewer = this.viewer;
    const earthAtNight = viewer.imageryLayers.addImageryProvider(
      new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      })
    );
    earthAtNight.splitDirection = Cesium.SplitDirection.RIGHT; // Only show to the left of the slider.
    const slider = document.getElementById('split');
    viewer.scene.splitPosition = slider.offsetLeft / slider.parentElement.offsetWidth;
    const handler = new Cesium.ScreenSpaceEventHandler(slider);
    let moveActive = false;
    function move(movement) {
      if (!moveActive) {
        return;
      }
      const relativeOffset = movement.endPosition.x;
      const splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth;
      slider.style.left = `${100.0 * splitPosition}%`;
      viewer.scene.splitPosition = splitPosition;
    }
    handler.setInputAction(function () {
      moveActive = true;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(function () {
      moveActive = true;
    }, Cesium.ScreenSpaceEventType.PINCH_START);

    handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

    handler.setInputAction(function () {
      moveActive = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    handler.setInputAction(function () {
      moveActive = false;
    }, Cesium.ScreenSpaceEventType.PINCH_END);
  },
  /**
   * 二维地图与三维地图同步
   */
  Sync2D() {
    var view3D = this.viewer;
    var view2D = this.view2D;
    // 三维地图中心点
    let center = new Cesium.Cartesian2(Math.floor(view3D.canvas.clientWidth / 2), Math.floor(view3D.canvas.clientHeight / 2));
    // 转为世界坐标系
    let position = view3D.scene.camera.pickEllipsoid(center);
    // 判断中心点是否在椭球体上
    if (Cesium.defined(position)) {
      // 获取三维地图中心点与相机之间的距离
      let distance = Cesium.Cartesian3.distance(position, view3D.camera.positionWC);
      // 更新二维地图
      view2D.scene.camera.lookAt(position, new Cesium.Cartesian3(0.0, 0.0, distance));
    }
  },
  /**
   * 地图反选遮罩（地图掩模）
   * @param areaJson 区域经纬度坐标
   */
  Mask(areaJson) {
    // 获取区域的经纬度坐标
    let positionArray = [];
    for (let i = 0; i < areaJson.length; i++) {
      positionArray.push(areaJson[i][0]);
      positionArray.push(areaJson[i][1]);
    }
    var viewer = this.viewer;
    // 遮罩
    let polygonEntity = new Cesium.Entity({
      id: 'mask_polygon',
      polygon: {
        hierarchy: {
          // 添加外部区域为1/4半圆，设置为180会报错
          positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 90, 179, 90, 179, 0]),
          // 中心挖空的“洞”
          holes: [
            {
              positions: Cesium.Cartesian3.fromDegreesArray(positionArray)
            }
          ]
        },
        // 设置贴地
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
        // material: new Cesium.Color(15 / 255.0, 38 / 255.0, 84 / 255.0, 0.7)
      }
    });

    // 边界线
    let lineEntity = new Cesium.Entity({
      id: 'mask_line',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(positionArray),
        width: 5,
        // 设置贴地
        clampToGround: true,
        material: Cesium.Color.YELLOW
      }
    });

    viewer.entities.add(polygonEntity);
    viewer.entities.add(lineEntity);
    viewer.flyTo(lineEntity);
  },
  /**
   * 自定义天空盒
   */
  CustomSkyBox() {
    var viewer = this.viewer;
    // 自定义的近地天空盒
    let groundSkybox = new Cesium.SkyBox({
      sources: {
        negativeX: negativeXImg,
        positiveX: positiveXImg,
        negativeY: negativeYImg,
        positiveY: positiveYImg,
        negativeZ: negativeZImg,
        positiveZ: positiveZImg
      }
    });

    // 自带的默认天空盒
    let defaultSkybox = viewer.scene.skyBox;

    // 渲染前监听并判断相机位置
    viewer.scene.preUpdate.addEventListener(() => {
      let position = viewer.scene.camera.position;
      let cameraHeight = Cesium.Cartographic.fromCartesian(position).height;
      if (cameraHeight < 240000) {
        viewer.scene.skyBox = groundSkybox;
        viewer.scene.skyAtmosphere.show = false;
      } else {
        viewer.scene.skyBox = defaultSkybox;
        viewer.scene.skyAtmosphere.show = true;
      }
    });
  },
  /**
   * 旋转实体
   * @param instance  实体
   * @param _rotation 旋转角度
   * @param _amount   旋转速度
   */
  RotateEntity(instance, _rotation, _amount) {
    let _this = this;
    instance.rotation = new Cesium.CallbackProperty(function () {
      _rotation += _amount;
      // if (_rotation >= 360 || _rotation <= -360) {
      //  return
      // }
      if (_this.endRotate == true) {
        return;
      }
      return Cesium.Math.toRadians(_rotation);
    }, false);
  },
  /**
   * 道路流动线效果
   * @param geojsonPath   geojson数据路径
   * @param polylineColor 折线颜色
   * @param polylineWidth 折线宽度
   * @param duration      持续时间
   */
  RoadShuttle(geojsonPath, cssColorString, polylineWidth, duration) {
    var viewer = this.viewer;
    // 加载GeoJSON数据，成功加载后，将其添加到Cesium的viewer中。
    Cesium.GeoJsonDataSource.load(geojsonPath)
      .then(function (data) {
        viewer.dataSources.add(data);
        // 颜色格式转换
        var polylineColor = Cesium.Color.fromCssColorString(cssColorString || '#0000FF'); // 默认为蓝色
        const entities = data.entities.values;
        // 设置折线外观
        for (let i = 0; i < entities.length; i++) {
          let entity = entities[i];
          // 设置折线的宽度
          entity.polyline.width = polylineWidth || 1.7;
          // 设置贴地
          entity.polyline.clampToGround = true;
          // 设置材质（激光轨迹效果）
          entity.polyline.material = new Cesium.LaserPolylineTrailLinkMaterialProperty(duration || 1000, polylineColor || Cesium.Color.BLUE);
        }
      })
      .catch(function (error) {
        console.error('加载数据失败：', error);
      });
    // 激光轨迹类，用于创建一个新的LaserPolylineTrailLinkMaterialProperty对象。它接受两个参数：持续时间和颜色。此构造函数中定义了一些内部变量，并初始化了颜色和持续时间。
    function LaserPolylineTrailLinkMaterialProperty(duration, color) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._colorSubscription = undefined;
      this.color = color; // 设置颜色
      this.duration = duration; // 设置持续时间
      this._time = new Date().getTime(); // 获取当前时间
    }

    Object.defineProperties(LaserPolylineTrailLinkMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color')
    });

    LaserPolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
      return 'PolylineTrailLink';
    };

    LaserPolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
      result.image = Cesium.Material.PolylineTrailLinkImage;
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
      return result;
    };

    LaserPolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
      return this === other || (other instanceof LaserPolylineTrailLinkMaterialProperty && Cesium.Property.equals(this._color, other._color));
    };

    Cesium.LaserPolylineTrailLinkMaterialProperty = LaserPolylineTrailLinkMaterialProperty;
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    // 定义渐变的模式（灰度图片）
    Cesium.Material.PolylineTrailLinkImage = gradientImg;
    // 定义着色器（最终的线颜色由输入的颜色和灰度图片共同决定）
    Cesium.Material.PolylineTrailLinkSource =
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
 { czm_material material = czm_getDefaultMaterial(materialInput); vec2 st = materialInput.st;\n\
    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
     material.alpha = colorImage.a * color.a;\n\
     material.diffuse = (colorImage.rgb + color.rgb) / 2.0;\n\
     return material;}';
    // 将此材质添加到Cesium的材质缓存中，以便可以在地图上使用。
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
      fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
          image: Cesium.Material.PolylineTrailLinkImage,
          time: 20
        },
        source: Cesium.Material.PolylineTrailLinkSource
      },
      translucent: function (material) {
        return true;
      }
    });
  },
  /**
   * 道路闪烁线效果
   */
  RoadFlashing() {
    var viewer = this.viewer;
    // 道路闪烁线
    Cesium.GeoJsonDataSource.load('../static/geojson/泰山区道路.geojson').then(function (dataSource) {
      viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;
      // 聚焦
      viewer.zoomTo(entities);
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        entity.polyline.width = 3.0;
        // 设置贴地
        entity.polyline.clampToGround = true;
        // 设置材质
        entity.polyline.material = new Cesium.LineFlickerMaterialProperty({
          color: Cesium.Color.YELLOW,
          // 设置随机变化速度
          speed: 10 * Math.random()
        });
      }
    });

    class LineFlickerMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.LineFlickerMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof LineFlickerMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(LineFlickerMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.LineFlickerMaterialProperty = LineFlickerMaterialProperty;
    Cesium.Material.LineFlickerMaterialProperty = 'LineFlickerMaterialProperty';
    Cesium.Material.LineFlickerMaterialType = 'LineFlickerMaterialType';
    Cesium.Material.LineFlickerMaterialSource = `
uniform vec4 color;
uniform float speed;
czm_material czm_getMaterial(czm_materialInput materialInput){
czm_material material = czm_getDefaultMaterial(materialInput);
float time = fract( czm_frameNumber  *  speed / 1000.0);
vec2 st = materialInput.st;
float scalar = smoothstep(0.0,1.0,time);
material.diffuse = color.rgb * scalar;
material.alpha = color.a * scalar ;
return material;
}
`;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlickerMaterialType, {
      fabric: {
        type: Cesium.Material.LineFlickerMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 5.0
        },
        source: Cesium.Material.LineFlickerMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });
  },
  /**
   * 竖直飞线效果
   * @param {Array} positions 线的坐标
   */
  LineFlowInit(positions) {
    class LineFlowMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this._percent = undefined;
        this._gradient = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.percent = options.percent;
        this.gradient = options.gradient;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.LineFlowMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
        result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof LineFlowMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed) && Cesium.Property.equals(this._percent, other._percent) && Cesium.Property.equals(this._gradient, other._gradient));
      }
    }

    Object.defineProperties(LineFlowMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed'),
      percent: Cesium.createPropertyDescriptor('percent'),
      gradient: Cesium.createPropertyDescriptor('gradient')
    });

    Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
    Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
    Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
    Cesium.Material.LineFlowMaterialSource = `
  uniform vec4 color;
  uniform float speed;
  uniform float percent;
  uniform float gradient;
  
  czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float t =fract(czm_frameNumber * speed / 1000.0);
    t *= (1.0 + percent);
    float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
    alpha += gradient;
    material.diffuse = color.rgb;
    material.alpha = alpha;
    return material;
  }
  `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
      fabric: {
        type: Cesium.Material.LineFlowMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0,
          percent: 0.1,
          gradient: 0.01
        },
        source: Cesium.Material.LineFlowMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });
    var viewer = this.viewer;
    positions.forEach((item, i) => {
      // 经纬度
      let start_lon = item[0];
      let start_lat = item[1];

      let startPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, 0);

      // 随机高度
      let height = 5000 * Math.random();
      let endPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, height);
      let linePositions = [];
      linePositions.push(startPoint);
      linePositions.push(endPoint);
      viewer.entities.add({
        id: '竖直飞线' + i,
        polyline: {
          positions: linePositions,
          material: new Cesium.LineFlowMaterialProperty({
            color: new Cesium.Color(1.0, 1.0, 0.0, 0.8),
            speed: 5 * Math.random(),
            percent: 0.1,
            gradient: 0.01
          })
        }
      });
    });
  },
  /**
   * 抛物流动飞线效果
   * @param {Array} positions 线的坐标
   * @param {Number} num      飞线数量
   */
  ParabolaFlowInit(center, num) {
    class LineFlowMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this._percent = undefined;
        this._gradient = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.percent = options.percent;
        this.gradient = options.gradient;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.LineFlowMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
        result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof LineFlowMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed) && Cesium.Property.equals(this._percent, other._percent) && Cesium.Property.equals(this._gradient, other._gradient));
      }
    }

    Object.defineProperties(LineFlowMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed'),
      percent: Cesium.createPropertyDescriptor('percent'),
      gradient: Cesium.createPropertyDescriptor('gradient')
    });

    Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
    Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
    Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
    Cesium.Material.LineFlowMaterialSource = `
  uniform vec4 color;
  uniform float speed;
  uniform float percent;
  uniform float gradient;
  
  czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float t =fract(czm_frameNumber * speed / 1000.0);
    t *= (1.0 + percent);
    float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
    alpha += gradient;
    material.diffuse = color.rgb;
    material.alpha = alpha;
    return material;
  }
  `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
      fabric: {
        type: Cesium.Material.LineFlowMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0,
          percent: 0.1,
          gradient: 0.01
        },
        source: Cesium.Material.LineFlowMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });
    var viewer = this.viewer;
    let list = [];
    for (let i = 0; i < num; i++) {
      // random产生的随机数范围是0-1，需要加上正负模拟
      let lon = center[0] + Math.random() * 0.1 * (i % 2 == 0 ? 1 : -1);
      let lat = center[1] + Math.random() * 0.1 * (i % 2 == 0 ? 1 : -1);
      list.push([lon, lat]);
    }
    list.forEach(item => {
      let _siglePositions = parabola(center, item, 5000);
      // 创建飞线
      for (let i = 0; i < num; i++) {
        viewer.entities.add({
          polyline: {
            positions: _siglePositions,
            material: new Cesium.LineFlowMaterialProperty({
              color: new Cesium.Color(1.0, 1.0, 0.0, 0.8),
              speed: 15 * Math.random(),
              percent: 0.1,
              gradient: 0.01
            })
          }
        });
      }
      // 创建轨迹线
      viewer.entities.add({
        polyline: {
          positions: _siglePositions,
          material: new Cesium.Color(1.0, 1.0, 0.0, 0.2)
        }
      });
    });

    /**
     * @description: 抛物线构造函数（参考开源代码）
     * @param {*}
     * @return {*}
     */
    function parabola(startPosition, endPosition, height = 0, count = 50) {
      //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
      let result = [];
      height = Math.max(+height, 100);
      count = Math.max(+count, 50);
      let diffLon = Math.abs(startPosition[0] - endPosition[0]);
      let diffLat = Math.abs(startPosition[1] - endPosition[1]);
      let L = Math.max(diffLon, diffLat);
      let dlt = L / count;
      if (diffLon > diffLat) {
        //base on lon
        let delLat = (endPosition[1] - startPosition[1]) / count;
        if (startPosition[0] - endPosition[0] > 0) {
          dlt = -dlt;
        }
        for (let i = 0; i < count; i++) {
          let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
          let lon = startPosition[0] + dlt * i;
          let lat = startPosition[1] + delLat * i;
          let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
          result.push(point);
        }
      } else {
        //base on lat
        let delLon = (endPosition[0] - startPosition[0]) / count;
        if (startPosition[1] - endPosition[1] > 0) {
          dlt = -dlt;
        }
        for (let i = 0; i < count; i++) {
          let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
          let lon = startPosition[0] + delLon * i;
          let lat = startPosition[1] + dlt * i;
          let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
          result.push(point);
        }
      }
      return result;
    }
  },
  /**
   * 面状要素的立体拉伸效果
   */
  SurfaceElementStretching() {
    var viewer = this.viewer;
    Cesium.GeoJsonDataSource.load('../static/geojson/财源街道边界.geojson').then(function (dataSource) {
      viewer.dataSources.add(dataSource);
      let entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        // 设置贴地
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        // 设置面的材质
        entity.polygon.material = new Cesium.Color(204 / 255, 247 / 255, 217 / 255, 0.6);
        entity.polygon.outline = false;
        // 将高度拉伸至200米
        entity.polygon.extrudedHeight = 200;
      }
    });
  },
  /**
   * 六边形扩散效果
   * @param {*} position 中心点
   * @param {*} color    颜色
   */
  HexagonDiffusion(position, color) {
    var viewer = this.viewer;
    // 点效果集合 父类
    class Effect {
      constructor(viewer, id) {
        this.viewer = viewer;
        this.id = id;
        this.duration = 1000;
        this.maxRadius = 1000;
        this.pointDraged = null;
        this.leftDownFlag = false;
      }
      change_duration(d) {
        this.duration = d;
      }
      change_color(val) {
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.color = new Cesium.Color.fromCssColorString(val);
      }
      change_position(p) {
        const cartesian3 = Cesium.Cartesian3.fromDegrees(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2]));
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity.position = cartesian3;
      }
      del() {
        this.viewer.entities.removeById(this.id);
      }
      add(position, color, maxRadius, duration, isEdit = false) {
        const _this = this;
        this.duration = duration;
        this.maxRadius = maxRadius;
        if (!isEdit) {
          return;
        }

        function leftDownAction(e) {
          _this.pointDraged = _this.viewer.scene.pick(e.position); // 选取当前的entity
          if (_this.pointDraged && _this.pointDraged.id && _this.pointDraged.id.id === _this.id) {
            _this.leftDownFlag = true;
            _this.viewer.scene.screenSpaceCameraController.enableRotate = false; // 锁定相机
          }
        }

        function leftUpAction(e) {
          _this.leftDownFlag = false;
          _this.pointDraged = null;
          _this.viewer.scene.screenSpaceCameraController.enableRotate = true; // 解锁相机
        }

        function mouseMoveAction(e) {
          if (_this.leftDownFlag === true && _this.pointDraged !== null && _this.pointDraged !== undefined) {
            const ray = _this.viewer.camera.getPickRay(e.endPosition);
            const cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            _this.pointDraged.id.position = cartesian; // 此处根据具体entity来处理，也可能是pointDraged.id.position=cartesian;
            // 这里笛卡尔坐标转 经纬度
            const ellipsoid = _this.viewer.scene.globe.ellipsoid;
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            let alt = cartographic.height;
            alt = alt < 0 ? 0 : alt;
            if (_this.update_position) {
              _this.update_position([lng.toFixed(8), lat.toFixed(8), alt]);
            }
          }
        }
        this.viewer.screenSpaceEventHandler.setInputAction(leftDownAction, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.viewer.screenSpaceEventHandler.setInputAction(leftUpAction, Cesium.ScreenSpaceEventType.LEFT_UP);
        this.viewer.screenSpaceEventHandler.setInputAction(mouseMoveAction, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    }

    //六边形扩散材质
    function HexagonSpreadMaterialProperty(color) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._colorSubscription = undefined;
      this.color = color;
      this._time = new Date().getTime();
    }
    Object.defineProperties(HexagonSpreadMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color')
    });
    HexagonSpreadMaterialProperty.prototype.getType = function (_time) {
      return Cesium.Material.HexagonSpreadMaterialType;
    };
    HexagonSpreadMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
      result.image = Cesium.Material.HexagonSpreadMaterialImage;
      return result;
    };
    HexagonSpreadMaterialProperty.prototype.equals = function (other) {
      const reData = this === other || (other instanceof HexagonSpreadMaterialProperty && Cesium.Property.equals(this._color, other._color));
      return reData;
    };
    Cesium.HexagonSpreadMaterialProperty = HexagonSpreadMaterialProperty;
    Cesium.Material.HexagonSpreadMaterialType = 'HexagonSpreadMaterial';
    Cesium.Material.HexagonSpreadMaterialImage = hexagonImg;
    Cesium.Material.HexagonSpreadSource = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
     czm_material material = czm_getDefaultMaterial(materialInput);
     vec2 st = materialInput.st;
     vec4 colorImage = texture2D(image,  vec2(st));
     material.alpha = colorImage.a * color.a * 0.5;
     material.diffuse =  1.8 * color.rgb  ;
     return material;
 }
 `;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.HexagonSpreadMaterialType, {
      fabric: {
        type: Cesium.Material.HexagonSpreadMaterialType,
        uniforms: {
          color: new Cesium.Color(1, 0, 0, 0.5),
          image: Cesium.Material.HexagonSpreadMaterialImage
        },
        source: Cesium.Material.HexagonSpreadSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 六边形扩散效果
    class HexagonSpread extends Effect {
      constructor(viewer, id) {
        super(viewer, id);
      }
      add(position, color, maxRadius, duration, isedit = false) {
        super.add(position, color, maxRadius, duration, isedit);
        const _this = this;
        let currentRadius = 1;
        this.viewer.entities.add({
          id: _this.id,
          position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
          ellipse: {
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            semiMajorAxis: new Cesium.CallbackProperty(function (n) {
              currentRadius += (1000 / _this.duration) * 50;
              if (currentRadius > _this.maxRadius) {
                currentRadius = 1;
              }
              return currentRadius;
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(function (n) {
              return currentRadius;
            }, false),
            material: new Cesium.HexagonSpreadMaterialProperty(new Cesium.Color.fromCssColorString(color))
          }
        });
      }
    }

    // 使用
    const hexagonSpread1 = new HexagonSpread(viewer, 'hexagonSpred1');
    hexagonSpread1.add(position, color, 1000, 7500);
  },
  /**
   * 动态流动水面
   * @param {Array} data 多边形坐标
   */
  FlowingWaterSurface(data) {
    var viewer = this.viewer;
    // 流动水面效果
    let waterPrimitive = new Cesium.GroundPrimitive({
      show: true, // 默认隐藏
      allowPicking: false,
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          id: 'water',
          polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(data)),
          extrudedHeight: 0,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
        })
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Water',
            uniforms: {
              // 水的基本颜色
              baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
              // 水的法线贴图
              normalMap: waterNormalsImg,
              // 水波纹的数量
              frequency: 1000.0,
              // 水的流速
              animationSpeed: 0.05,
              // 水波纹振幅
              amplitude: 10,
              // 镜面反射强度
              specularIntensity: 10
            }
          }
        })
      })
    });
    viewer.scene.groundPrimitives.add(waterPrimitive);
  },
  /**
   * 绘制墙
   * @param {Array} polygonArray 坐标数组
   */
  DrawWall(polygonArray) {
    const instances = [];
    const geometry = new Cesium.WallGeometry({
      positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
      // 设置高度
      maximumHeights: new Array(polygonArray.length).fill(400),
      minimunHeights: new Array(polygonArray.length).fill(0)
    });
    instances.push(
      new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREEN)
        }
      })
    );

    // 合并单个geometry,提高渲染效率
    const primitive = new Cesium.Primitive({
      show: true, // 默认隐藏
      allowPicking: false,
      geometryInstances: instances,
      // PerInstanceColorAppearance：使用每个实例自定义的颜色着色
      appearance: new Cesium.PerInstanceColorAppearance()
    });
    this.viewer.scene.primitives.add(primitive);
  },
  /**
   * 动态立体墙效果
   * @param {Array} polygonArray 坐标数组
   */
  DynamicWall(polygonArray) {
    const viewer = this.viewer;
    //动态墙材质
    function DynamicWallMaterialProperty(options) {
      // 默认参数设置
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._colorSubscription = undefined;
      this.color = options.color;
      this.duration = options.duration;
      this.trailImage = options.trailImage;
      this._time = new Date().getTime();
    }
    Object.defineProperties(DynamicWallMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color')
    });
    DynamicWallMaterialProperty.prototype.getType = function (time) {
      return 'DynamicWall';
    };
    DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
      if (this.trailImage) {
        result.image = this.trailImage;
      } else {
        result.image = Cesium.Material.DynamicWallImage;
      }

      if (this.duration) {
        result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
      }
      viewer.scene.requestRender();
      return result;
    };
    DynamicWallMaterialProperty.prototype.equals = function (other) {
      return this === other || (other instanceof DynamicWallMaterialProperty && Cesium.Property.equals(this._color, other._color));
    };
    Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;
    Cesium.Material.DynamicWallType = 'DynamicWall';
    Cesium.Material.DynamicWallImage = colorsImg;
    Cesium.Material.DynamicWallSource =
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                          {\n\
                                          czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                          vec2 st = materialInput.st;\n\
                                          vec4 colorImage = texture2D(image, vec2(fract(st.t - time), st.t));\n\
                                          vec4 fragColor;\n\
                                          fragColor.rgb = color.rgb / 1.0;\n\
                                          fragColor = czm_gammaCorrect(fragColor);\n\
                                          material.alpha = colorImage.a * color.a;\n\
                                          material.diffuse = color.rgb;\n\
                                          material.emission = fragColor.rgb;\n\
                                          return material;\n\
                                          }';
    Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
      fabric: {
        type: Cesium.Material.DynamicWallType,
        uniforms: {
          color: new Cesium.Color(1.0, 1.0, 1.0, 1),
          image: Cesium.Material.DynamicWallImage,
          time: 0
        },
        source: Cesium.Material.DynamicWallSource
      },
      translucent: function (material) {
        return true;
      }
    });
    for (let i = 0; i < viewer.entities.values.length; i++) {
      if (viewer.entities.values[i].id == 'dynamicWall') {
        viewer.entities.remove(viewer.entities.values[i]);
      }
    }
    // 绘制墙体
    viewer.entities.add({
      name: '立体墙效果',
      id: 'dynamicWall',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
        // 设置高度
        maximumHeights: new Array(polygonArray.length).fill(600),
        minimunHeights: new Array(polygonArray.length).fill(0),
        material: new Cesium.DynamicWallMaterialProperty({
          color: Cesium.Color.fromBytes(55, 96, 56).withAlpha(0.7),
          duration: 3000
        })
      }
    });
  },
  /**
   * 动态流动墙体效果
   * @param {Array} polygonArray 坐标数组
   */
  FlowWall(polygonArray) {
    const viewer = this.viewer;
    //流动墙材质
    function TrailLineMaterialProperty(options) {
      // 默认参数设置
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._colorSubscription = undefined;
      this.color = options.color;
      this.duration = options.duration;
      this._time = new Date().getTime();
    }
    Object.defineProperties(TrailLineMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color')
    });
    TrailLineMaterialProperty.prototype.getType = function (time) {
      return 'TrailLine';
    };
    TrailLineMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);

      if (this.duration) {
        result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
      }
      viewer.scene.requestRender();
      return result;
    };
    TrailLineMaterialProperty.prototype.equals = function (other) {
      return this === other || (other instanceof TrailLineMaterialProperty && Cesium.Property.equals(this._color, other._color));
    };
    Cesium.TrailLineMaterialProperty = TrailLineMaterialProperty;
    Cesium.Material.TrailLineType = 'TrailLine';
    Cesium.Material.TrailLineImage = arrowImg;
    Cesium.Material.TrailLineSource =
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
   czm_material material = czm_getDefaultMaterial(materialInput);\n\
   vec2 st = materialInput.st;\n\
   vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
   material.alpha = colorImage.a * color.a;\n\
   material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
   return material;\n\
}';
    Cesium.Material._materialCache.addMaterial(Cesium.Material.TrailLineType, {
      fabric: {
        type: Cesium.Material.TrailLineType,
        uniforms: {
          color: new Cesium.Color(1.0, 1.0, 1.0, 1),
          image: Cesium.Material.TrailLineImage,
          time: 0
        },
        source: Cesium.Material.TrailLineSource
      },
      translucent: function (material) {
        return true;
      }
    });
    for (let i = 0; i < viewer.entities.values.length; i++) {
      if (viewer.entities.values[i].id == 'flowWall') {
        viewer.entities.remove(viewer.entities.values[i]);
      }
    }
    viewer.entities.add({
      name: '流动墙效果',
      id: 'flowWall',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
        // 设置高度
        maximumHeights: new Array(polygonArray.length).fill(840),
        minimunHeights: new Array(polygonArray.length).fill(600),
        material: new Cesium.TrailLineMaterialProperty({
          color: Cesium.Color.RED,
          duration: 18000
        })
      }
    });
  },
  /**
   * 动态扩散墙效果
   * @param {Array} _positions 坐标数组
   * @param {Number} _scale    最大缩放比例
   * @param {Number} _height   高度
   * @param {Object} _material 材质
   */
  DiffusionWall(_positions, _scale, _height, _material) {
    let scale = 1;
    this.viewer.entities.add({
      name: '扩散墙',
      id: 'diffusionWall',
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          // 判断是放大还是缩小
          // _scale：最大缩放比例
          if (_scale >= 1) {
            scale += _scale / 200.0;
            if (scale >= _scale) {
              scale = 1.0;
            }
          } else {
            scale -= _scale / 200.0;
            if (scale <= _scale) {
              scale = 1;
            }
          }
          let polygon = turf.polygon(_positions);
          let scaledPolygon = turf.transformScale(polygon, scale);
          let newPositions = [];
          // 遍历多边形
          for (let i = 0; i < scaledPolygon.geometry.coordinates[0].length; i++) {
            // 遍历节点
            scaledPolygon.geometry.coordinates[0][i].forEach(item => {
              newPositions.push(item);
            });
            // _height：墙高度
            newPositions.push(_height);
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(newPositions);
        }, false),
        // material：墙材质
        material: _material
      }
    });
  },
  /**
   * 正多边形扩散墙效果
   * @param {Object} options 参数
   */
  RegularPolygonDiffusionWall(options) {
    // 墙材质
    class WallDiffuseMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this.color = options.color;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.WallDiffuseMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof WallDiffuseMaterialProperty && Cesium.Property.equals(this._color, other._color));
      }
    }

    Object.defineProperties(WallDiffuseMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color')
    });

    Cesium.WallDiffuseMaterialProperty = WallDiffuseMaterialProperty;
    Cesium.Material.WallDiffuseMaterialProperty = 'WallDiffuseMaterialProperty';
    Cesium.Material.WallDiffuseMaterialType = 'WallDiffuseMaterialType';
    Cesium.Material.WallDiffuseMaterialSource = `
  uniform vec4 color;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  material.diffuse = color.rgb * 2.0;
  material.alpha = color.a * (1.0-fract(st.t)) * 0.8;
  return material;
  }                                         
  `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseMaterialType, {
      fabric: {
        type: Cesium.Material.WallDiffuseMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0)
        },
        source: Cesium.Material.WallDiffuseMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });
    let _viewer = this.viewer;
    // 扩散中心点
    let _center = options.center;
    // 扩散半径半径
    let _radius = options.radius || 1000.0;
    // 扩散正多变形的边数
    let _edge = options.edge || 64;
    // 扩散速度
    let _speed = options.speed || 5.0;
    // 扩散高度
    let _height = options.height || 100.0;
    // 实时高度
    let _currentHeight = _height;
    // 最小半径
    let _minRadius = options.minRadius || 10;
    // 实时半径
    let _currentRadius = _minRadius;
    if (_edge < 3) {
      return false;
    }
    //获取当前多边形的节点位置和高度
    function _getPositions(_center, _edge, _currentRadius, _currentHeight) {
      let positions = [];
      let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(_center[0], _center[1], 0));
      for (let i = 0; i < _edge; i++) {
        let angle = (i / _edge) * Cesium.Math.TWO_PI;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        let point = new Cesium.Cartesian3(x * _currentRadius, y * _currentRadius, _currentHeight);
        positions.push(Cesium.Matrix4.multiplyByPoint(modelMatrix, point, new Cesium.Cartesian3()));
      }
      // 封闭墙，首节点点需要存两次
      positions.push(positions[0]);
      return positions;
    }
    // 添加多边形
    _viewer.entities.add({
      id: 'RegularPolygonDiffusionWall',
      wall: {
        // callbackProperty回调函数，实时更新
        positions: new Cesium.CallbackProperty(() => {
          let positions = [];
          _currentRadius += (_radius * _speed) / 1000.0;
          _currentHeight -= (_height * _speed) / 1000.0;

          // 判断扩散的实际半径和高度是否超出范围
          if (_currentRadius > _radius || _currentHeight < 0) {
            _currentRadius = _minRadius;
            _currentHeight = _height;
          }

          positions = _getPositions(_center, _edge, _currentRadius, _currentHeight);
          return positions;
        }, false),
        // 设置材质
        material: new Cesium.WallDiffuseMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
        })
      }
    });
  },
  /**
   * 立体墙（垂直、水平）渐变泛光效果
   * @param {Array} positions 墙的节点位置
   */
  GradientFloodWall(positions) {
    // 材质
    class WallDiffuseMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this.color = options.color;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.WallDiffuseMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof WallDiffuseMaterialProperty && Cesium.Property.equals(this._color, other._color));
      }
    }

    Object.defineProperties(WallDiffuseMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color')
    });

    Cesium.WallDiffuseMaterialProperty = WallDiffuseMaterialProperty;
    Cesium.Material.WallDiffuseMaterialProperty = 'WallDiffuseMaterialProperty';
    Cesium.Material.WallDiffuseMaterialType = 'WallDiffuseMaterialType';
    // 立体向下渐变效果：material.alpha = color.a * (fract(st.t)) * 0.8;
    // 水平逆时针渐变效果：material.alpha = color.a * (fract(st.s)) * 0.8;
    // 水平顺时针渐变效果：material.alpha = color.a * (1.0 - fract(st.s)) * 0.8;
    Cesium.Material.WallDiffuseMaterialSource = `
  uniform vec4 color;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  material.diffuse = color.rgb * 2.0;
  material.alpha = color.a * (1.0 - fract(st.t)) * 0.8;
  return material;
  }
                                          
  `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseMaterialType, {
      fabric: {
        type: Cesium.Material.WallDiffuseMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0)
        },
        source: Cesium.Material.WallDiffuseMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 绘制墙体
    this.viewer.entities.add({
      name: '立体墙效果',
      id: 'GradientFloodWall',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        // 设置高度
        maximumHeights: new Array(positions.length).fill(840),
        minimunHeights: new Array(positions.length).fill(0),
        // 扩散墙材质
        material: new Cesium.WallDiffuseMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
        })
      }
    });
  },
  /**
   * 旋转圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  RotateCircle(x, y) {
    // 旋转圆
    let circleRotate = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'circleRotateTest',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.ImageMaterialProperty({
          image: circle_rotateImg
        })
      }
    });
    rotateMaterial(circleRotate.ellipse, 0, 1);
    /**
     * @description: 旋转材质
     * @param {*} instance ：实体
     * @param {*} _stRotation : 初始材质旋转角度
     * @param {*} _amount ：旋转角度变化量
     * @return {*}
     */

    function rotateMaterial(instance, _stRotation, _amount) {
      instance.stRotation = new Cesium.CallbackProperty(function () {
        _stRotation += _amount;
        if (_stRotation >= 360 || _stRotation <= -360) {
          _stRotation = 0;
        }
        return Cesium.Math.toRadians(_stRotation);
      }, false);
    }
  },
  /**
   * 扫描圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  ScanningCircle(x, y) {
    // 材质
    class CircleScanMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleScanMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleScanMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleScanMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleScanMaterialProperty = CircleScanMaterialProperty;
    Cesium.Material.CircleScanMaterialProperty = 'CircleScanMaterialProperty';
    Cesium.Material.CircleScanMaterialType = 'CircleScanMaterialType';
    Cesium.Material.CircleScanMaterialSource = `
  uniform vec4 color;
  uniform float speed;

  float circle(vec2 uv, float r, float blur) {
  float d = length(uv) * 2.0;
  float c = smoothstep(r+blur, r, d);
  return c;
  }

  czm_material czm_getMaterial(czm_materialInput materialInput)
  {
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st - .5;
  material.diffuse = color.rgb;
  material.emission = vec3(0);
  float t =fract(czm_frameNumber * speed / 1000.0);
  float s = 0.3;
  float radius1 = smoothstep(.0, s, t) * 0.5;
  float alpha1 = circle(st, radius1, 0.01) * circle(st, radius1, -0.01);
  float alpha2 = circle(st, radius1, 0.01 - radius1) * circle(st, radius1, 0.01);
  float radius2 = 0.5 + smoothstep(s, 1.0, t) * 0.5;
  float alpha3 = circle(st, radius1, radius2 + 0.01 - radius1) * circle(st, radius1, -0.01);
  material.alpha = smoothstep(1.0, s, t) * (alpha1 + alpha2*0.1 + alpha3*0.1);
  material.alpha *= color.a;
  return material;
  }

  `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleScanMaterialType, {
      fabric: {
        type: Cesium.Material.CircleScanMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleScanMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 扫描圆
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'scanningCircleTest',
      name: '扫描圆',
      ellipse: {
        semiMajorAxis: 1000.0,
        semiMinorAxis: 1000.0,
        material: new Cesium.CircleScanMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
          speed: 20.0
        })
      }
    });
  },
  /**
   * 波纹圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  WavyCircle(x, y) {
    // 材质
    class CircleRippleMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.count = options.count;
        this.gradient = options.gradient;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleRippleMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        result.count = this.count;
        result.gradient = this.gradient;
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleRippleMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed) && Cesium.Property.equals(this.count, other.count) && Cesium.Property.equals(this.gradient, other.gradient));
      }
    }

    Object.defineProperties(CircleRippleMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed'),
      count: Cesium.createPropertyDescriptor('count'),
      gradient: Cesium.createPropertyDescriptor('gradient')
    });

    Cesium.CircleRippleMaterialProperty = CircleRippleMaterialProperty;
    Cesium.Material.CircleRippleMaterialProperty = 'CircleRippleMaterialProperty';
    Cesium.Material.CircleRippleMaterialType = 'CircleRippleMaterialType';
    Cesium.Material.CircleRippleMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;
                                          uniform float count;
                                          uniform float gradient;

                                          czm_material czm_getMaterial(czm_materialInput materialInput)
                                          {
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          material.diffuse = 1.5 * color.rgb;
                                          vec2 st = materialInput.st;
                                          float dis = distance(st, vec2(0.5, 0.5));
                                          float per = fract(czm_frameNumber * speed / 1000.0);
                                          if(count == 1.0){
                                              if(dis > per * 0.5){
                                              discard;
                                              }else {
                                              material.alpha = color.a  * dis / per / 2.0;
                                              }
                                          } else {
                                              vec3 str = materialInput.str;
                                              if(abs(str.z)  > 0.001){
                                              discard;
                                              }
                                              if(dis > 0.5){
                                              discard;
                                              } else {
                                              float perDis = 0.5 / count;
                                              float disNum;
                                              float bl = 0.0;
                                              for(int i = 0; i <= 999; i++){
                                                  if(float(i) <= count){
                                                  disNum = perDis * float(i) - dis + per / count;
                                                  if(disNum > 0.0){
                                                      if(disNum < perDis){
                                                      bl = 1.0 - disNum / perDis;
                                                      }
                                                      else if(disNum - perDis < perDis){
                                                      bl = 1.0 - abs(1.0 - disNum / perDis);
                                                      }
                                                      material.alpha = pow(bl,(1.0 + 10.0 * (1.0 - gradient)));
                                                  }
                                                  }
                                              }
                                              }
                                          }
                                          return material;
                                          }
                                          `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleRippleMaterialType, {
      fabric: {
        type: Cesium.Material.CircleRippleMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 3.0,
          count: 4,
          gradient: 0.2
        },
        source: Cesium.Material.CircleRippleMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });
    // 波纹圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'wavyCircle',
      name: '波纹圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleRippleMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0,
          count: 4,
          gradient: 0.2
        })
      }
    });
  },
  /**
   * 扩散圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  DiffusionCircle(x, y) {
    // 材质
    class CircleDiffuseMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleDiffuseMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleDiffuseMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleDiffuseMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleDiffuseMaterialProperty = CircleDiffuseMaterialProperty;
    Cesium.Material.CircleDiffuseMaterialProperty = 'CircleDiffuseMaterialProperty';
    Cesium.Material.CircleDiffuseMaterialType = 'CircleDiffuseMaterialType';
    Cesium.Material.CircleDiffuseMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;

                                          vec3 circlePing(float r, float innerTail,  float frontierBorder, float timeResetSeconds,  float radarPingSpeed,  float fadeDistance){
                                          float t = fract(czm_frameNumber * speed / 1000.0);
                                          float time = mod(t, timeResetSeconds) * radarPingSpeed;
                                          float circle;
                                          circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
                                          circle *= smoothstep(fadeDistance, 0.0, r);
                                          return vec3(circle);
                                          }

                                          czm_material czm_getMaterial(czm_materialInput materialInput){
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          vec2 st = materialInput.st * 2.0  - 1.0 ;
                                          vec2 center = vec2(0.);
                                          float time = fract(czm_frameNumber * speed / 1000.0);
                                          vec3 flagColor;
                                          float r = length(st - center) / 4.;
                                          flagColor += circlePing(r, 0.25, 0.025, 4.0, 0.3, 1.0) * color.rgb;
                                          material.alpha = length(flagColor);
                                          material.diffuse = flagColor.rgb;
                                          return material;
                                          }

                                          `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleDiffuseMaterialType, {
      fabric: {
        type: Cesium.Material.CircleDiffuseMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleDiffuseMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 扩散圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'diffusionCircle',
      name: '扩散圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleDiffuseMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 消隐圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  BlankingCircle(x, y) {
    // 材质
    class CircleFadeMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleFadeMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleFadeMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleFadeMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleFadeMaterialProperty = CircleFadeMaterialProperty;
    Cesium.Material.CircleFadeMaterialProperty = 'CircleFadeMaterialProperty';
    Cesium.Material.CircleFadeMaterialType = 'CircleFadeMaterialType';
    Cesium.Material.CircleFadeMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;

                                          czm_material czm_getMaterial(czm_materialInput materialInput){
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          material.diffuse = 1.5 * color.rgb;
                                          vec2 st = materialInput.st;
                                          float dis = distance(st, vec2(0.5, 0.5));
                                          float per = fract(czm_frameNumber * speed / 1000.0);
                                          if(dis > per * 0.5){
                                              material.alpha = color.a;
                                          }else {
                                              discard;
                                          }
                                          return material;
                                          }
                                          `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleFadeMaterialType, {
      fabric: {
        type: Cesium.Material.CircleFadeMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleFadeMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 消隐圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'blankingCircle',
      name: '消隐圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleFadeMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 模糊圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  FuzzyCircle(x, y) {
    // 材质
    class CircleBlurMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleBlurMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleBlurMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleBlurMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleBlurMaterialProperty = CircleBlurMaterialProperty;
    Cesium.Material.CircleBlurMaterialProperty = 'CircleBlurMaterialProperty';
    Cesium.Material.CircleBlurMaterialType = 'CircleBlurMaterialType';
    Cesium.Material.CircleBlurMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;
                                          czm_material czm_getMaterial(czm_materialInput materialInput){
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          vec2 st = materialInput.st ;
                                          vec2 center = vec2(0.5);
                                          float time = fract(czm_frameNumber * speed / 1000.0);
                                          float r = 0.5 + sin(time) / 3.0;
                                          float dis = distance(st, center);
                                          float a = 0.0;
                                          if(dis < r) {
                                              a = 1.0 - smoothstep(0.0, r, dis);
                                          }
                                          material.alpha = pow(a,10.0) ;
                                          material.diffuse = color.rgb * a * 3.0;
                                          return material;
                                          }
                                          `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleBlurMaterialType, {
      fabric: {
        type: Cesium.Material.CircleBlurMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleBlurMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 模糊圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'fuzzyCircle',
      name: '模糊圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleBlurMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 螺旋圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  SpiralCircle(x, y) {
    // 材质
    class CircleSpiralMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleSpiralMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleSpiralMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleSpiralMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleSpiralMaterialProperty = CircleSpiralMaterialProperty;
    Cesium.Material.CircleSpiralMaterialProperty = 'CircleSpiralMaterialProperty';
    Cesium.Material.CircleSpiralMaterialType = 'CircleSpiralMaterialType';
    Cesium.Material.CircleSpiralMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;
                                          #define PI 3.14159265359

                                          vec2 rotate2D (vec2 _st, float _angle) {
                                          _st =  mat2(cos(_angle),-sin(_angle),  sin(_angle),cos(_angle)) * _st;
                                          return _st;
                                          }
                                          czm_material czm_getMaterial(czm_materialInput materialInput){
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          vec2 st = materialInput.st * 2.0 - 1.0;
                                          st *= 1.6;
                                          float time = czm_frameNumber * speed / 1000.0;
                                          float r = length(st);
                                          float w = .3;
                                          st = rotate2D(st,(r*PI*6.-time*2.));
                                          float a = smoothstep(-w,.2,st.x) * smoothstep(w,.2,st.x);
                                          float b = abs(1./(sin(pow(r,2.)*2.-time*1.3)*6.))*.4;
                                          material.alpha = a * b ;
                                          material.diffuse = color.rgb * a * b  * 3.0;
                                          return material;
                                          }
                                          `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleSpiralMaterialType, {
      fabric: {
        type: Cesium.Material.CircleSpiralMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleSpiralMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 螺旋圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'spiralCircle',
      name: '螺旋圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleSpiralMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 多彩圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  MulticoloredCircle(x, y) {
    // 材质
    class CircleColorfulMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CircleColorfulMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CircleColorfulMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(CircleColorfulMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CircleColorfulMaterialProperty = CircleColorfulMaterialProperty;
    Cesium.Material.CircleColorfulMaterialProperty = 'CircleColorfulMaterialProperty';
    Cesium.Material.CircleColorfulMaterialType = 'CircleColorfulMaterialType';
    Cesium.Material.CircleColorfulMaterialSource = `
                                              uniform vec4 color;
                                              uniform float speed;

                                              czm_material czm_getMaterial(czm_materialInput materialInput){
                                              czm_material material = czm_getDefaultMaterial(materialInput);
                                              vec2 st = materialInput.st  * 2.0 - 1.0;
                                              float time =czm_frameNumber * speed / 1000.0;
                                              float radius = length(st);
                                              float angle = atan(st.y/st.x);
                                              float radius1 = sin(time * 2.0) + sin(40.0*angle+time)*0.01;
                                              float radius2 = cos(time * 3.0);
                                              vec3 fragColor = 0.2 + 0.5 * cos( time + color.rgb + vec3(0,2,4));
                                              float inten1 = 1.0 - sqrt(abs(radius1 - radius));
                                              float inten2 = 1.0 - sqrt(abs(radius2 - radius));
                                              material.alpha = pow(inten1 + inten2 , 5.0) ;
                                              material.diffuse = fragColor * (inten1 + inten2);
                                              return material;
                                              }`;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleColorfulMaterialType, {
      fabric: {
        type: Cesium.Material.CircleColorfulMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CircleColorfulMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 多彩圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'colorfulCircle',
      name: '多彩圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CircleColorfulMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 脉冲圆
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  PulseCircle(x, y) {
    // 材质
    class CirclePulseMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.CirclePulseMaterialType;
      }

      getValue(time, result) {
        result = Cesium.defaultValue(result, {});
        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof CirclePulseMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    // 设置属性
    Object.defineProperties(CirclePulseMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.CirclePulseMaterialProperty = CirclePulseMaterialProperty;
    Cesium.Material.CirclePulseMaterialProperty = 'CirclePulseMaterialProperty';
    Cesium.Material.CirclePulseMaterialType = 'CirclePulseMaterialType';
    Cesium.Material.CirclePulseMaterialSource = `
                                          uniform vec4 color;
                                          uniform float speed;
                                          czm_material czm_getMaterial(czm_materialInput materialInput) {
                                              czm_material material = czm_getDefaultMaterial(materialInput);
                                              vec2 st = materialInput.st * 2.0 - 1.0;
                                              float time = fract(czm_frameNumber * speed / 1000.0);
                                              float r = length(st) * 1.2;
                                              float a = pow(r, 2.0);
                                              float b = sin(r * 0.8 - 1.6);
                                              float c = sin(r - 0.010);
                                              float s = sin(a - time * 2.0 + b) * c;
                                              float d = abs(1.0 / (s * 10.8)) - 0.01;
                                              material.alpha = pow(d, 10.0);
                                              material.diffuse = color.rgb * d;
                                              return material;
                                          }
                                          `;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CirclePulseMaterialType, {
      fabric: {
        type: Cesium.Material.CirclePulseMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.CirclePulseMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 脉冲圆特效
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'pulseCircle',
      name: '脉冲圆',
      ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        material: new Cesium.CirclePulseMaterialProperty({
          color: new Cesium.Color(1, 1, 0, 0.7),
          speed: 12.0
        })
      }
    });
  },
  /**
   * 水波纹扩散效果
   * @param {Number} x  经度
   * @param {Number} y  纬度
   */
  WaterRippleDiffusion(x, y) {
    /**
     * 水波纹扩散材质
     *
     *
     * @param {*} color  颜色
     * @param {*} duration 持续时间 毫秒
     * @param {*} count  波浪数量
     * @param {*} gradient 渐变曲率
     */
    function CircleWaveMaterialProperty(ob) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._colorSubscription = undefined;
      this.color = ob.color;
      this.duration = Cesium.defaultValue(ob.duration, 1000);
      this.count = Cesium.defaultValue(ob.count, 2);
      if (this.count <= 0) {
        this.count = 1;
      }
      this.gradient = Cesium.defaultValue(ob.gradient, 0.1);
      if (this.gradient === 0) {
        this.gradient = 0;
      }
      if (this.gradient > 1) {
        this.gradient = 1;
      }
      this._time = new Date().getTime();
    }
    Object.defineProperties(CircleWaveMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color'),
      duration: Cesium.createPropertyDescriptor('duration'),
      count: Cesium.createPropertyDescriptor('count')
    });
    CircleWaveMaterialProperty.prototype.getType = function (_time) {
      return Cesium.Material.CircleWaveMaterialType;
    };
    CircleWaveMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
      result.count = this.count;
      result.gradient = 1 + 10 * (1 - this.gradient);
      return result;
    };
    CircleWaveMaterialProperty.prototype.equals = function (other) {
      const reData = this === other || (other instanceof CircleWaveMaterialProperty && Cesium.Property.equals(this._color, other._color));
      return reData;
    };
    Cesium.CircleWaveMaterialProperty = CircleWaveMaterialProperty;
    Cesium.Material.CircleWaveMaterialType = 'CircleWaveMaterial';
    Cesium.Material.CircleWaveSource = `
                                  czm_material czm_getMaterial(czm_materialInput materialInput) {
                                    czm_material material = czm_getDefaultMaterial(materialInput);
                                    material.diffuse = 1.5 * color.rgb;
                                    vec2 st = materialInput.st;
                                    vec3 str = materialInput.str;
                                    float dis = distance(st, vec2(0.5, 0.5));
                                    float per = fract(time);
                                    if (abs(str.z) > 0.001) {
                                      discard;
                                    }
                                    if (dis > 0.5) {
                                      discard;
                                    } else {
                                      float perDis = 0.5 / count;
                                      float disNum;
                                      float bl = .0;
                                      for (int i = 0; i <= 9; i++) {
                                        if (float(i) <= count) {
                                          disNum = perDis *float(i) - dis + per / count;
                                          if (disNum > 0.0) {
                                            if (disNum < perDis) {
                                              bl = 1.0 - disNum / perDis;
                                            } else if(disNum - perDis < perDis) {
                                              bl = 1.0 - abs(1.0 - disNum / perDis);
                                            }
                                            material.alpha = pow(bl, gradient);
                                          }
                                        }
                                      }
                                    }
                                    return material;
                                  }
                                  `;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleWaveMaterialType, {
      fabric: {
        type: Cesium.Material.CircleWaveMaterialType,
        uniforms: {
          color: new Cesium.Color(1, 0, 0, 1),
          time: 1,
          count: 1,
          gradient: 0.1
        },
        source: Cesium.Material.CircleWaveSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 点效果集合 父类
    class Effect {
      constructor(viewer, id) {
        this.viewer = viewer;
        this.id = id;
        this.duration = 1000;
        this.maxRadius = 1000;
        this.pointDraged = null;
        this.leftDownFlag = false;
      }
      change_duration(d) {
        this.duration = d;
      }
      change_color(val) {
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.color = new Cesium.Color.fromCssColorString(val);
      }
      change_position(p) {
        const cartesian3 = Cesium.Cartesian3.fromDegrees(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2]));
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity.position = cartesian3;
      }
      del() {
        this.viewer.entities.removeById(this.id);
      }
      add(position, color, maxRadius, duration, isEdit = false) {
        const _this = this;
        this.duration = duration;
        this.maxRadius = maxRadius;
        if (!isEdit) {
          return;
        }

        function leftDownAction(e) {
          _this.pointDraged = _this.viewer.scene.pick(e.position); // 选取当前的entity
          if (_this.pointDraged && _this.pointDraged.id && _this.pointDraged.id.id === _this.id) {
            _this.leftDownFlag = true;
            _this.viewer.scene.screenSpaceCameraController.enableRotate = false; // 锁定相机
          }
        }

        function leftUpAction(e) {
          _this.leftDownFlag = false;
          _this.pointDraged = null;
          _this.viewer.scene.screenSpaceCameraController.enableRotate = true; // 解锁相机
        }

        function mouseMoveAction(e) {
          if (_this.leftDownFlag === true && _this.pointDraged !== null && _this.pointDraged !== undefined) {
            const ray = _this.viewer.camera.getPickRay(e.endPosition);
            const cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            _this.pointDraged.id.position = cartesian; // 此处根据具体entity来处理，也可能是pointDraged.id.position=cartesian;
            // 这里笛卡尔坐标转 经纬度
            const ellipsoid = _this.viewer.scene.globe.ellipsoid;
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            let alt = cartographic.height;
            alt = alt < 0 ? 0 : alt;
            if (_this.update_position) {
              _this.update_position([lng.toFixed(8), lat.toFixed(8), alt]);
            }
          }
        }
        this.viewer.screenSpaceEventHandler.setInputAction(leftDownAction, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.viewer.screenSpaceEventHandler.setInputAction(leftUpAction, Cesium.ScreenSpaceEventType.LEFT_UP);
        this.viewer.screenSpaceEventHandler.setInputAction(mouseMoveAction, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    }

    // 水波纹
    class CircleWave extends Effect {
      constructor(viewer, id) {
        super(viewer, id);
      }
      change_duration(d) {
        super.change_duration(d);
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.duration = d;
      }
      change_waveCount(d) {
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.count = d;
      }
      add(position, color, maxRadius, duration, isedit = false, count = 3) {
        super.add(position, color, maxRadius, duration, isedit);
        const _this = this;
        this.count = count;
        this.viewer.entities.add({
          id: _this.id,
          position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
          ellipse: {
            // height: position[2],
            semiMinorAxis: new Cesium.CallbackProperty(function (n) {
              return _this.maxRadius;
            }, false),
            semiMajorAxis: new Cesium.CallbackProperty(function (n) {
              return _this.maxRadius;
            }, false),
            material: new Cesium.CircleWaveMaterialProperty({
              duration: duration,
              gradient: 0,
              color: new Cesium.Color.fromCssColorString(color),
              count: count
            })
          }
        });
      }
    }

    // 水波纹扩散
    let circleWave = new CircleWave(this.viewer, 'cirCleWave1');
    // 中心点坐标、颜色、半径、持续时间
    circleWave.add([x, y, 0], '#1FA8E3', 500, 3000);
  },
  /**
   * 圆扩散效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {Number} z 高度
   */
  CircularDiffusion(x, y, z) {
    // 材质
    // 圆扩散
    class CircleDiffusion {
      constructor(viewer) {
        this.viewer = viewer;
        this.lastStageList = [];
        // js语法的每行结尾的“分号”可写可不写
      }
      add(position, scanColor, maxRadius, duration) {
        this.lastStageList.push(this.showCircleScan(position, scanColor, maxRadius, duration));
      }
      clear() {
        this.lastStageList.forEach(ele => {
          this.clearScanEffects(ele);
        });
        this.lastStageList = [];
      }
      /**
       * 圆扩散
       * @param {*} position  扫描中心 如[117.270739,31.84309,32]
       * @param {*} scanColor 扫描颜色 如"rgba(0,255,0,1)"
       * @param {*} maxRadius 扫描半径，单位米 如1000米
       * @param {*} duration 持续时间，单位毫秒 如4000
       */
      showCircleScan(position, scanColor, maxRadius, duration) {
        const cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(position[0]), Cesium.Math.toRadians(position[1]), position[2]);
        scanColor = new Cesium.Color.fromCssColorString(scanColor);
        const lastStage = this._addCircleScanPostStage(cartographicCenter, maxRadius, scanColor, duration);
        return lastStage;
      }
      /**
       * 添加扩散效果扫描线
       * @param {*} cartographicCenter  扫描中心
       * @param {*} maxRadius 扫描半径
       * @param {*} scanColor  扫描颜色
       * @param {*} duration  持续时间
       */
      _addCircleScanPostStage(cartographicCenter, maxRadius, scanColor, duration) {
        const _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        const _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
        const _CartograhpicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        const _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
        const _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
        const _time = new Date().getTime();
        const _scratchCartesian4Center = new Cesium.Cartesian4();
        const _scratchCartesian4Center1 = new Cesium.Cartesian4();
        const _scratchCartesian3Normal = new Cesium.Cartesian3();
        const _this = this;
        const ScanPostStage = new Cesium.PostProcessStage({
          fragmentShader: _this._getScanSegmentShader(),
          uniforms: {
            u_scanCenterEC: function () {
              const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
              return temp;
            },
            u_scanPlaneNormalEC: function () {
              const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
              const temp1 = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
              _scratchCartesian3Normal.x = temp1.x - temp.x;
              _scratchCartesian3Normal.y = temp1.y - temp.y;
              _scratchCartesian3Normal.z = temp1.z - temp.z;
              Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
              return _scratchCartesian3Normal;
            },
            u_radius: function () {
              return (maxRadius * ((new Date().getTime() - _time) % duration)) / duration;
            },
            u_scanColor: scanColor
          }
        });
        this.viewer.scene.postProcessStages.add(ScanPostStage);
        return ScanPostStage;
      }
      /**
       * 扩散效果Shader
       */
      _getScanSegmentShader() {
        const inpram = 18;
        const scanSegmentShader =
          ` uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 v_textureCoordinates;
        uniform vec4 u_scanCenterEC;
        uniform vec3 u_scanPlaneNormalEC;
        uniform float u_radius;
        uniform vec4 u_scanColor;
        vec4 toEye(in vec2 uv, in float depth){
          vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
          vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
          posInCamera =posInCamera / posInCamera.w;
          return posInCamera;
        }
        vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
            vec3 v01 = point - planeOrigin;
            float d = dot(planeNormal, v01) ;
            return (point - planeNormal * d);
        }
        float getDepth(in vec4 depth){
            float z_window = czm_unpackDepth(depth);
            z_window = czm_reverseLogDepth(z_window);
            float n_range = czm_depthRange.near;
            float f_range = czm_depthRange.far;
            return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        }
        void main(){
            gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
            vec4 viewPos = toEye(v_textureCoordinates, depth);
            vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
            float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
            if(dis < u_radius){
              float f = 1.0 - abs(u_radius - dis) / u_radius;
              f = pow(f, float(` +
          inpram +
          `));
              gl_FragColor = mix(gl_FragColor,u_scanColor,f);
            }
            gl_FragColor.a = gl_FragColor.a / 2.0;
        }
      `;
        return scanSegmentShader;
      }
      /**
       * 清除特效对象
       * @param {*} lastStage 特效对象
       */
      clearScanEffects(lastStage) {
        this.viewer.scene.postProcessStages.remove(lastStage);
      }
    }

    // 圆扩散
    const circleDiffusion = new CircleDiffusion(this.viewer);
    circleDiffusion.add([x, y, z], '#F7EB08', 800, 9500);
  },
  /**
   * 线圈发光效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {Number} z 高度
   */
  CoilLuminescence(x, y, z) {
    // 材质
    // 点效果集合 父类
    class Effect {
      constructor(viewer, id) {
        this.viewer = viewer;
        this.id = id;
        this.duration = 1000;
        this.maxRadius = 1000;
        this.pointDraged = null;
        this.leftDownFlag = false;
      }
      change_duration(d) {
        this.duration = d;
      }
      change_color(val) {
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.color = new Cesium.Color.fromCssColorString(val);
      }
      change_position(p) {
        const cartesian3 = Cesium.Cartesian3.fromDegrees(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2]));
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity.position = cartesian3;
      }
      del() {
        this.viewer.entities.removeById(this.id);
      }
      add(position, color, maxRadius, duration, isEdit = false) {
        const _this = this;
        this.duration = duration;
        this.maxRadius = maxRadius;
        if (!isEdit) {
          return;
        }

        function leftDownAction(e) {
          _this.pointDraged = _this.viewer.scene.pick(e.position); // 选取当前的entity
          if (_this.pointDraged && _this.pointDraged.id && _this.pointDraged.id.id === _this.id) {
            _this.leftDownFlag = true;
            _this.viewer.scene.screenSpaceCameraController.enableRotate = false; // 锁定相机
          }
        }

        function leftUpAction(e) {
          _this.leftDownFlag = false;
          _this.pointDraged = null;
          _this.viewer.scene.screenSpaceCameraController.enableRotate = true; // 解锁相机
        }

        function mouseMoveAction(e) {
          if (_this.leftDownFlag === true && _this.pointDraged !== null && _this.pointDraged !== undefined) {
            const ray = _this.viewer.camera.getPickRay(e.endPosition);
            const cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            _this.pointDraged.id.position = cartesian; // 此处根据具体entity来处理，也可能是pointDraged.id.position=cartesian;
            // 这里笛卡尔坐标转 经纬度
            const ellipsoid = _this.viewer.scene.globe.ellipsoid;
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            let alt = cartographic.height;
            alt = alt < 0 ? 0 : alt;
            if (_this.update_position) {
              _this.update_position([lng.toFixed(8), lat.toFixed(8), alt]);
            }
          }
        }
        this.viewer.screenSpaceEventHandler.setInputAction(leftDownAction, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.viewer.screenSpaceEventHandler.setInputAction(leftUpAction, Cesium.ScreenSpaceEventType.LEFT_UP);
        this.viewer.screenSpaceEventHandler.setInputAction(mouseMoveAction, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    }
    // 线圈发光扩散效果
    class Scanline extends Effect {
      constructor(viewer, id) {
        super(viewer, id);
      }
      change_duration(d) {
        super.change_duration(d);
        const curEntity = this.viewer.entities.getById(this.id);
        curEntity._ellipse._material.speed = d;
      }
      add(position, color, maxRadius, speed, isedit = false) {
        super.add(position, color, maxRadius, speed, isedit);
        const _this = this;
        this.viewer.entities.add({
          id: _this.id,
          position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
          ellipse: {
            semiMinorAxis: new Cesium.CallbackProperty(function (n) {
              return _this.maxRadius;
            }, false),
            semiMajorAxis: new Cesium.CallbackProperty(function (n) {
              return _this.maxRadius;
            }, false),
            material: new Cesium.ScanlineMaterialProperty(new Cesium.Color.fromCssColorString(color), speed),
            classificationType: Cesium.ClassificationType.BOTH
          }
        });
      }
    }

    function ScanlineMaterialProperty(color, speed) {
      this._definitionChanged = new Cesium.Event();
      this.color = color || Cesium.Color.YELLOW;
      this.speed = speed || 10;
    }

    Object.defineProperties(ScanlineMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false;
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged;
        }
      },
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    ScanlineMaterialProperty.prototype.getType = function (_time) {
      return Cesium.Material.ScanlineType;
    };
    ScanlineMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
      result.speed = this.speed;
      return result;
    };

    ScanlineMaterialProperty.prototype.equals = function (other) {
      const reData = this === other || (other instanceof ScanlineMaterialProperty && Cesium.Property.equals(this.color, other.color) && Cesium.Property.equals(this.speed, other.speed));
      return reData;
    };
    Cesium.ScanlineMaterialProperty = ScanlineMaterialProperty;
    Cesium.Material.ScanlineType = 'Scanline';
    Cesium.Material.ScanlineSource = `
uniform vec4 color;
uniform float speed;
float circle(vec2 uv, float r, float blur) {
  float d = length(uv) * 1.0; /* 2.0 */
  float c = smoothstep(r+blur, r, d);
  return c;
}
czm_material czm_getMaterial(czm_materialInput materialInput)
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st - 0.5;
  material.diffuse = 2.8 * color.rgb;
  material.emission = vec3(0);
  float t = fract(czm_frameNumber * (11000.0 - speed) / 500000.0);
  float s = 0.3;
  float radius1 = smoothstep(.0, s, t) * 0.5;
  float alpha1 = circle(st, radius1, 0.01) * circle(st, radius1, -0.01);
  float alpha2 = circle(st, radius1, 0.01 - radius1) * circle(st, radius1, 0.01);
  float radius2 = 0.5 + smoothstep(s, 1.0, t) * 0.5;
  float alpha3 = circle(st, radius1, radius2 + 0.01 - radius1) * circle(st, radius1, -0.01);
  material.alpha = smoothstep(1.0, s, t) * (alpha1 + alpha2*0.1 + alpha3*0.1);
  material.alpha *= color.a ;
  return material;
}
`;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.ScanlineType, {
      fabric: {
        type: Cesium.Material.ScanlineType,
        uniforms: {
          color: new Cesium.Color(1, 0, 0, 0.5),
          time: 0,
          speed: 10
        },
        source: Cesium.Material.ScanlineSource
      },
      translucent: function (t) {
        return true;
      }
    });

    // 线圈发光扩散
    let scanLine1 = new Scanline(this.viewer, 'scanLine1');
    // 中心点坐标、颜色、半径、持续时间
    scanLine1.add([x, y, z], '#CE1374', 1200, 15);
  },
  /**
   * 雷达平扫效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {Number} z 高度
   */
  RadarSweep(x, y, z) {
    var that = this;
    // 材质
    class CircleScan {
      constructor(viewer) {
        this.viewer = viewer;
        this.lastStageList = [];
      }
      add(position, scanColor, maxRadius, duration) {
        this.lastStageList.push(this.showRadarScan(position, scanColor, maxRadius, duration));
        console.log(this.lastStageList);
      }
      clear() {
        this.lastStageList.forEach(ele => {
          this.clearScanEffects(ele);
        });
        this.lastStageList = [];
      }
      /**
       * 雷达扫描
       * @param {*} position  扫描中心 如[117.270739,31.84309,32]
       * @param {*} scanColor 扫描颜色 如"rgba(0,255,0,1)"
       * @param {*} maxRadius 扫描半径，单位米 如1000米
       * @param {*} duration 持续时间，单位毫秒 如4000
       */
      showRadarScan(position, scanColor, maxRadius, duration) {
        const cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(position[0]), Cesium.Math.toRadians(position[1]), position[2]);
        scanColor = new Cesium.Color.fromCssColorString(scanColor);
        const lastStage = this._addRadarScanPostStage(cartographicCenter, maxRadius, scanColor, duration);
        return lastStage;
      }
      /**
       *  添加雷达扫描线
       * @param {*} cartographicCenter  扫描中心
       * @param {*} maxRadius 扫描半径
       * @param {*} scanColor  扫描颜色
       * @param {*} duration  持续时间
       */
      _addRadarScanPostStage(cartographicCenter, radius, scanColor, duration) {
        const _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        const _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

        const _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        const _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        const _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

        const _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
        const _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        const _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
        const _RotateQ = new Cesium.Quaternion();
        const _RotateM = new Cesium.Matrix3();

        const _time = new Date().getTime();

        const _scratchCartesian4Center = new Cesium.Cartesian4();
        const _scratchCartesian4Center1 = new Cesium.Cartesian4();
        const _scratchCartesian4Center2 = new Cesium.Cartesian4();
        const _scratchCartesian3Normal = new Cesium.Cartesian3();
        const _scratchCartesian3Normal1 = new Cesium.Cartesian3();

        const _this = this;
        const ScanPostStage = new Cesium.PostProcessStage({
          fragmentShader: this._getRadarScanShader(),
          uniforms: {
            u_scanCenterEC: function () {
              return Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
            },
            u_scanPlaneNormalEC: function () {
              const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
              const temp1 = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
              _scratchCartesian3Normal.x = temp1.x - temp.x;
              _scratchCartesian3Normal.y = temp1.y - temp.y;
              _scratchCartesian3Normal.z = temp1.z - temp.z;

              Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
              return _scratchCartesian3Normal;
            },
            u_radius: radius,
            u_scanLineNormalEC: function () {
              const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
              const temp1 = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
              const temp2 = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);

              _scratchCartesian3Normal.x = temp1.x - temp.x;
              _scratchCartesian3Normal.y = temp1.y - temp.y;
              _scratchCartesian3Normal.z = temp1.z - temp.z;

              Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

              _scratchCartesian3Normal1.x = temp2.x - temp.x;
              _scratchCartesian3Normal1.y = temp2.y - temp.y;
              _scratchCartesian3Normal1.z = temp2.z - temp.z;

              const tempTime = ((new Date().getTime() - _time) % duration) / duration;
              Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
              Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
              Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
              Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
              return _scratchCartesian3Normal1;
            },
            u_scanColor: scanColor
          }
        });
        this.viewer.scene.postProcessStages.add(ScanPostStage);

        return ScanPostStage;
      }
      /**
       * 雷达扫描线效果Shader
       */
      _getRadarScanShader() {
        const scanSegmentShader =
          'uniform sampler2D colorTexture;\n' +
          'uniform sampler2D depthTexture;\n' +
          'varying vec2 v_textureCoordinates;\n' +
          'uniform vec4 u_scanCenterEC;\n' +
          'uniform vec3 u_scanPlaneNormalEC;\n' +
          'uniform vec3 u_scanLineNormalEC;\n' +
          'uniform float u_radius;\n' +
          'uniform vec4 u_scanColor;\n' +
          'vec4 toEye(in vec2 uv, in float depth)\n' +
          ' {\n' +
          ' vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n' +
          ' vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n' +
          ' posInCamera =posInCamera / posInCamera.w;\n' +
          ' return posInCamera;\n' +
          ' }\n' +
          'bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n' +
          '{\n' +
          'vec3 v01 = testPt - ptOnLine;\n' +
          'normalize(v01);\n' +
          'vec3 temp = cross(v01, lineNormal);\n' +
          'float d = dot(temp, u_scanPlaneNormalEC);\n' +
          'return d > 0.5;\n' +
          '}\n' +
          'vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n' +
          '{\n' +
          'vec3 v01 = point -planeOrigin;\n' +
          'float d = dot(planeNormal, v01) ;\n' +
          'return (point - planeNormal * d);\n' +
          '}\n' +
          'float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n' +
          '{\n' +
          'vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n' +
          'return length(tempPt - ptOnLine);\n' +
          '}\n' +
          'float getDepth(in vec4 depth)\n' +
          '{\n' +
          'float z_window = czm_unpackDepth(depth);\n' +
          'z_window = czm_reverseLogDepth(z_window);\n' +
          'float n_range = czm_depthRange.near;\n' +
          'float f_range = czm_depthRange.far;\n' +
          'return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n' +
          '}\n' +
          'void main()\n' +
          '{\n' +
          'gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
          'float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n' +
          'vec4 viewPos = toEye(v_textureCoordinates, depth);\n' +
          'vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n' +
          'float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n' +
          'float twou_radius = u_radius * 2.0;\n' +
          'if(dis < u_radius)\n' +
          '{\n' +
          'float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n' +
          'f0 = pow(f0, 64.0);\n' +
          'vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n' +
          'float f = 0.0;\n' +
          'if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n' +
          '{\n' +
          'float dis1= length(prjOnPlane.xyz - lineEndPt);\n' +
          'f = abs(twou_radius -dis1) / twou_radius;\n' +
          'f = pow(f, 3.0);\n' +
          '}\n' +
          'gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n' +
          '}\n' +
          '}\n';
        return scanSegmentShader;
      }
      /**
       * 清除特效对象
       * @param {*} lastStage 特效对象
       */
      clearScanEffects(lastStage) {
        this.viewer.scene.postProcessStages.remove(lastStage);
      }
    }

    // 雷达平扫
    const circleScan = new CircleScan(this.viewer);
    // 中心点坐标，颜色，半径，持续时间
    circleScan.add([x, y, z], '#BB00FF', 400, 3000);
  },
  /**
   * 清除特效对象
   */
  clearAllLastStage() {
    this.lastStageList.forEach(ele => {
      this.viewer.scene.postProcessStages.remove(ele);
    });
    this.lastStageList = [];
  },
  /**
   * 雷达线效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  RadarLine(x, y) {
    // 材质
    class RadarLineMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.RadarLineMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof RadarLineMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(RadarLineMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.RadarLineMaterialProperty = RadarLineMaterialProperty;
    Cesium.Material.RadarLineMaterialProperty = 'RadarLineMaterialProperty';
    Cesium.Material.RadarLineMaterialType = 'RadarLineMaterialType';
    Cesium.Material.RadarLineMaterialSource = `
  uniform vec4 color;
  uniform float speed;

  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st * 2.0 - 1.0;
  float t = czm_frameNumber * speed / 1000.0 ;
  vec3 col = vec3(0.0);
  vec2 p = vec2(sin(t), cos(t));
  float d = length(st - dot(p, st) * p);
  if (dot(st, p) < 0.) {
      d = length(st);
  }

  col = .006 / d * color.rgb;

  if(distance(st,vec2(0)) >  0.99 ){
      col =color.rgb;
  }

  material.alpha  = pow(length(col),2.0);
  material.diffuse = col * 3.0 ;
  return material;
  }
   `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.RadarLineMaterialType, {
      fabric: {
        type: Cesium.Material.RadarLineMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.RadarLineMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 雷达线
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'radarLine',
      name: '雷达线',
      ellipse: {
        semiMajorAxis: 1000.0,
        semiMinorAxis: 1000.0,
        material: new Cesium.RadarLineMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
          speed: 20.0
        })
      }
    });
  },
  /**
   * 波纹雷达效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  RippleRadar(x, y) {
    // 材质
    class RadarWaveMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.RadarWaveMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof RadarWaveMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(RadarWaveMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.RadarWaveMaterialProperty = RadarWaveMaterialProperty;
    Cesium.Material.RadarWaveMaterialProperty = 'RadarWaveMaterialProperty';
    Cesium.Material.RadarWaveMaterialType = 'RadarWaveMaterialType';
    Cesium.Material.RadarWaveMaterialSource = `
  uniform vec4 color;
  uniform float speed;

  #define PI 3.14159265359

  float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  vec2 pos = st - vec2(0.5);
  float time = czm_frameNumber * speed / 1000.0 ;
  float r = length(pos);
  float t = atan(pos.y, pos.x) - time * 2.5;
  float a = (atan(sin(t), cos(t)) + PI)/(2.0*PI);
  float ta = 0.5;
  float v = smoothstep(ta-0.05,ta+0.05,a) * smoothstep(ta+0.05,ta-0.05,a);
  vec3 flagColor = color.rgb * v;
  float blink = pow(sin(time*1.5)*0.5+0.5, 0.8);
  flagColor = color.rgb *  pow(a, 8.0*(.2+blink))*(sin(r*500.0)*.5+.5) ;
  flagColor = flagColor * pow(r, 0.4);
  material.alpha = length(flagColor) * 1.3;
  material.diffuse = flagColor * 3.0;
  return material;
  }
   `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.RadarWaveMaterialType, {
      fabric: {
        type: Cesium.Material.RadarWaveMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.RadarWaveMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 波纹雷达
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'radarWave',
      name: '波纹雷达',
      ellipse: {
        semiMajorAxis: 1000.0,
        semiMinorAxis: 1000.0,
        material: new Cesium.RadarWaveMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
          speed: 20.0
        })
      }
    });
  },
  /**
   * 图片雷达效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  PictureRadar(x, y) {
    // 图片雷达
    let rader = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      name: '图片雷达',
      id: 'pictureRadar',
      ellipse: {
        semiMajorAxis: 1000.0,
        semiMinorAxis: 1000.0,
        material: new Cesium.ImageMaterialProperty({
          image: radarImg,
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.7)
        }),
        // 不设置高度则无法渲染外框线
        height: 20.0,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        outline: true,
        outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
      }
    });

    rotateMaterial(rader.ellipse, 0, -3);

    /**
     * @description: 旋转材质
     * @param {*} instance ：实体
     * @param {*} _stRotation : 初始材质旋转角度
     * @param {*} _amount ：旋转角度变化量
     * @return {*}
     */
    function rotateMaterial(instance, _stRotation, _amount) {
      instance.stRotation = new Cesium.CallbackProperty(function () {
        _stRotation += _amount;
        if (_stRotation >= 360 || _stRotation <= -360) {
          _stRotation = 0;
        }
        return Cesium.Math.toRadians(_stRotation);
      }, false);
    }
  },
  /**
   * 雷达扫描效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  RadarScanning(x, y) {
    // 材质
    class RadarScanMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.RadarScanMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof RadarScanMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(RadarScanMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.RadarScanMaterialProperty = RadarScanMaterialProperty;
    Cesium.Material.RadarScanMaterialProperty = 'RadarScanMaterialProperty';
    Cesium.Material.RadarScanMaterialType = 'RadarScanMaterialType';
    Cesium.Material.RadarScanMaterialSource = `
  uniform vec4 color;
  uniform float speed;

  #define PI 3.14159265359

  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  vec2 scrPt = st * 2.0 - 1.0;
  float time = czm_frameNumber * speed / 1000.0 ;
  vec3 col = vec3(0.0);
  mat2 rot;
  float theta = -time * 1.0 * PI - 2.2;
  float cosTheta, sinTheta;
  cosTheta = cos(theta);
  sinTheta = sin(theta);
  rot[0][0] = cosTheta;
  rot[0][1] = -sinTheta;
  rot[1][0] = sinTheta;
  rot[1][1] = cosTheta;
  vec2 scrPtRot = rot * scrPt;
  float angle = 1.0 - (atan(scrPtRot.y, scrPtRot.x) / 6.2831 + 0.5);
  float falloff = length(scrPtRot);
  material.alpha = pow(length(col + vec3(.5)),5.0);
  material.diffuse =  (0.5 +  pow(angle, 2.0) * falloff ) *   color.rgb    ;
  return material;
  }

   `;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.RadarScanMaterialType, {
      fabric: {
        type: Cesium.Material.RadarScanMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.RadarScanMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 雷达扫描效果2
    let rader = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      id: 'radarScanning',
      name: '雷达扫描效果2',
      ellipse: {
        semiMajorAxis: 1000.0,
        semiMinorAxis: 1000.0,
        material: new Cesium.RadarScanMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
          speed: 20.0
        }),
        height: 20.0,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        outline: true,
        outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
      }
    });
  },
  /**
   * 立体雷达扫描效果
   * @param {Object} options 参数
   */
  StereoRadarScanning(options) {
    var viewer = this.viewer;
    this._viewer = viewer;
    // 半径
    this._radius = options.radius;
    // 扫描扇形颜色
    this._color = options.color;
    // 扫描速度
    this._speed = options.speed;
    // 中心点坐标经纬度
    this._cenLon = options.position[0];
    this._cenLat = options.position[1];

    // 先建立椭球体
    this._viewer.entities.add({
      position: new Cesium.Cartesian3.fromDegrees(this._cenLon, this._cenLat),
      name: '立体雷达扫描',
      id: 'stereoRadarScanning',
      ellipsoid: {
        radii: new Cesium.Cartesian3(this._radius, this._radius, this._radius),
        material: this._color,
        outline: true,
        outlineColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
        outlineWidth: 1
      }
    });

    let heading = 0;
    let positionArr = [];
    // 每一帧刷新时调用
    this._viewer.clock.onTick.addEventListener(() => {
      heading += this._speed;
      positionArr = calculatePane(this._cenLon, this._cenLat, 1000.0, heading);
    });

    // 创建1/4圆形立体墙
    let radarWall = this._viewer.entities.add({
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.fromDegreesArrayHeights(positionArr);
        }, false),
        material: this._color
      }
    });

    // 计算平面扫描范围
    function calculatePane(x1, y1, radius, heading) {
      var m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1));
      var rx = radius * Math.cos((heading * Math.PI) / 180.0);
      var ry = radius * Math.sin((heading * Math.PI) / 180.0);
      var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
      var d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3());
      var c = Cesium.Cartographic.fromCartesian(d);
      var x2 = Cesium.Math.toDegrees(c.longitude);
      var y2 = Cesium.Math.toDegrees(c.latitude);
      return calculateSector(x1, y1, x2, y2);
    }

    // 计算竖直扇形
    function calculateSector(x1, y1, x2, y2) {
      let positionArr = [];
      positionArr.push(x1);
      positionArr.push(y1);
      positionArr.push(0);
      var radius = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(x1, y1), Cesium.Cartesian3.fromDegrees(x2, y2));
      // 扇形是1/4圆，因此角度设置为0-90
      for (let i = 0; i <= 90; i++) {
        let h = radius * Math.sin((i * Math.PI) / 180.0);
        let r = Math.cos((i * Math.PI) / 180.0);
        let x = (x2 - x1) * r + x1;
        let y = (y2 - y1) * r + y1;
        positionArr.push(x);
        positionArr.push(y);
        positionArr.push(h);
      }
      return positionArr;
    }
  },
  /**
   * 轨迹球体效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  TrajectorySphere(x, y) {
    // 材质
    class EllipsoidTrailMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.EllipsoidTrailMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof EllipsoidTrailMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(EllipsoidTrailMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.EllipsoidTrailMaterialProperty = EllipsoidTrailMaterialProperty;
    Cesium.Material.EllipsoidTrailMaterialProperty = 'EllipsoidTrailMaterialProperty';
    Cesium.Material.EllipsoidTrailMaterialType = 'EllipsoidTrailMaterialType';
    Cesium.Material.EllipsoidTrailMaterialSource = `
  uniform vec4 color;
  uniform float speed;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  float time = fract(czm_frameNumber * speed / 1000.0);
  float alpha = abs(smoothstep(0.5,1.,fract( -st.t - time)));
  alpha += .1;
  material.alpha = alpha;
  material.diffuse = color.rgb;
  return material;
}
`;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidTrailMaterialType, {
      fabric: {
        type: Cesium.Material.EllipsoidTrailMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.EllipsoidTrailMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 轨迹球体效果
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      name: '轨迹球体',
      id: 'trajectorySphere',
      ellipsoid: {
        radii: new Cesium.Cartesian3(1000.0, 1000.0, 1000.0),
        material: new Cesium.EllipsoidTrailMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
          speed: 10.0
        })
      }
    });
  },
  /**
   * 电弧球体效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   */
  ArcSphere(x, y) {
    // 材质
    class EllipsoidElectricMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
      }

      get isConstant() {
        return false;
      }

      get definitionChanged() {
        return this._definitionChanged;
      }

      getType(time) {
        return Cesium.Material.EllipsoidElectricMaterialType;
      }

      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
      }

      equals(other) {
        return this === other || (other instanceof EllipsoidElectricMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
      }
    }

    Object.defineProperties(EllipsoidElectricMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed')
    });

    Cesium.EllipsoidElectricMaterialProperty = EllipsoidElectricMaterialProperty;
    Cesium.Material.EllipsoidElectricMaterialProperty = 'EllipsoidElectricMaterialProperty';
    Cesium.Material.EllipsoidElectricMaterialType = 'EllipsoidElectricMaterialType';
    Cesium.Material.EllipsoidElectricMaterialSource = `
uniform vec4 color;
uniform float speed;

#define pi 3.1415926535
#define PI2RAD 0.01745329252
#define TWO_PI (2. * PI)

float rands(float p){
return fract(sin(p) * 10000.0);
}

float noise(vec2 p){
float time = fract( czm_frameNumber * speed / 1000.0);
float t = time / 20000.0;
if(t > 1.0) t -= floor(t);
return rands(p.x * 14. + p.y * sin(t) * 0.5);
}

vec2 sw(vec2 p){
return vec2(floor(p.x), floor(p.y));
}

vec2 se(vec2 p){
return vec2(ceil(p.x), floor(p.y));
}

vec2 nw(vec2 p){
return vec2(floor(p.x), ceil(p.y));
}

vec2 ne(vec2 p){
return vec2(ceil(p.x), ceil(p.y));
}

float smoothNoise(vec2 p){
vec2 inter = smoothstep(0.0, 1.0, fract(p));
float s = mix(noise(sw(p)), noise(se(p)), inter.x);
float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
return mix(s, n, inter.y);
}

float fbm(vec2 p){
float z = 2.0;
float rz = 0.0;
vec2 bp = p;
for(float i = 1.0; i < 6.0; i++){
    rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
    z *= 2.0;
    p *= 2.0;
}
return rz;
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
czm_material material = czm_getDefaultMaterial(materialInput);
vec2 st = materialInput.st;
vec2 st2 = materialInput.st;
float time = fract( czm_frameNumber * speed / 1000.0);
if (st.t < 0.5) {
    discard;
}
st *= 4.;
float rz = fbm(st);
st /= exp(mod( time * 2.0, pi));
rz *= pow(15., 0.9);
vec4 temp = vec4(0);
temp = mix( color / rz, vec4(color.rgb, 0.1), 0.2);
if (st2.s < 0.05) {
    temp = mix(vec4(color.rgb, 0.1), temp, st2.s / 0.05);
}
if (st2.s > 0.95){
    temp = mix(temp, vec4(color.rgb, 0.1), (st2.s - 0.95) / 0.05);
}
material.diffuse = temp.rgb;
material.alpha = temp.a * 2.0;
return material;
}
`;

    Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidElectricMaterialType, {
      fabric: {
        type: Cesium.Material.EllipsoidElectricMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0
        },
        source: Cesium.Material.EllipsoidElectricMaterialSource
      },
      translucent: function (material) {
        return true;
      }
    });

    // 电弧球体效果
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(x, y),
      name: '电弧球体',
      id: 'arcSphere',
      ellipsoid: {
        radii: new Cesium.Cartesian3(1000.0, 1000.0, 1000.0),
        material: new Cesium.EllipsoidElectricMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
          speed: 5.0
        })
      }
    });
  },
  /**
   * 广告牌效果
   * @param {Number} lon 经度
   * @param {Number} lat 纬度
   * @param {String} name 名称
   * @param {String} color 颜色
   */
  Billboard(lon, lat, name, color) {
    var viewer = this.viewer;
    viewer.entities.add({
      name: name,
      id: 'billboard',
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
      // 图标
      billboard: {
        image: billbordImg,
        width: 50,
        height: 50
      },
      label: {
        //文字标签
        text: name,
        font: '20px sans-serif',
        style: Cesium.LabelStyle.FILL,
        // 对齐方式(水平和竖直)
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(20, -2),
        showBackground: true,
        backgroundColor: new Cesium.Color.fromBytes(0, 70, 24)
      }
    });

    // 先画线后画点，防止线压盖点
    let linePositions = [];
    linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 5));
    linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 1000));
    viewer.entities.add({
      polyline: {
        positions: linePositions,
        width: 1.5,
        material: color
      }
    });

    // 画点
    viewer.entities.add({
      id: 'billboard_point',
      // 给初始点位设置一定的离地高度，否者会被压盖
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 5),
      point: {
        color: color,
        pixelSize: 15
      }
    });
  },
  /**
   * 点聚合
   * @param {Array} pointArray 点位数组
   */
  PointClustering(pointArray) {
    var viewer = this.viewer;
    //聚合属性只对label标签，point点和广告牌billboard生效
    const dataSource = new Cesium.CustomDataSource('myData');
    // 添加数据源
    const pinBuilder = new Cesium.PinBuilder();
    const pin50 = pinBuilder.fromText('100+', Cesium.Color.RED, 72).toDataURL();
    const pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 56).toDataURL();
    const pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
    const pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 40).toDataURL();
    const pin10 = pinBuilder.fromText('3+', Cesium.Color.BLUE, 36).toDataURL();
    // 点
    for (let i = 0; i < pointArray.length; ++i) {
      dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(pointArray[i][0], pointArray[i][1], 1000),
        // point: {
        //     color: Cesium.Color.RED,
        // },
        label: {
          text: 'POI',
          font: 'bold 15px Microsoft YaHei',
          // 竖直对齐方式
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          // 水平对齐方式
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          // 偏移量
          pixelOffset: new Cesium.Cartesian2(15, 0)
        },
        billboard: {
          image: poiImg,
          width: 32,
          height: 32
        }
      });
    }
    const dataSourcePromise = viewer.dataSources.add(dataSource);
    dataSourcePromise.then(function (dataSource) {
      // 设置聚合参数
      dataSource.clustering.enabled = true;
      dataSource.clustering.pixelRange = 60;
      dataSource.clustering.minimumClusterSize = 2;
      // 添加监听函数
      dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

        if (clusteredEntities.length >= 100) {
          cluster.billboard.image = pin50;
        } else if (clusteredEntities.length >= 40) {
          cluster.billboard.image = pin40;
        } else if (clusteredEntities.length >= 30) {
          cluster.billboard.image = pin30;
        } else if (clusteredEntities.length >= 20) {
          cluster.billboard.image = pin20;
        } else if (clusteredEntities.length >= 3) {
          cluster.billboard.image = pin10;
        } else {
          cluster.billboard.image = poiImg;
        }
      });
    });
    /**
     * @description: 将图片和文字合成新图标使用（参考Cesium源码）
     * @param {*} url：图片地址
     * @param {*} label：文字
     * @param {*} size：画布大小
     * @return {*} 返回canvas
     */
    function combineIconAndLabel(url, label, size) {
      // 创建画布对象
      let canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      let ctx = canvas.getContext('2d');
      let promise = new Cesium.Resource.fetchImage(url).then(image => {
        // 异常判断
        try {
          ctx.drawImage(image, 0, 0);
        } catch (e) {
          console.log(e);
        }

        // 渲染字体
        // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
        ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
        ctx.font = 'bold 20px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, size / 2, size / 2);

        return canvas;
      });
      return promise;
    }
  },
  /**
   * 粒子效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {String} type 粒子类型
   */
  ParticleEffect(x, y, type) {
    // 粒子图片
    var Img = fire1Img;
    // 粒子在生命周期开始时的颜色
    var startColor = new Cesium.Color(1, 1, 1, 1);
    //粒子在生命周期结束时的颜色
    var endColor = new Cesium.Color(0.5, 0, 0, 0);
    if (type == '火焰') {
      Img = fire1Img;
      startColor = new Cesium.Color(1, 1, 1, 1);
      endColor = new Cesium.Color(0.5, 0, 0, 0);
    } else if ((type = '水枪')) {
      Img = waterImg;
      startColor = new Cesium.Color(1, 1, 1, 0.6);
      endColor = new Cesium.Color(0.8, 0.86, 1, 0.4);
    } else if ((type = '爆炸')) {
      Img = explosionImg;
      startColor = Cesium.Color.RED.withAlpha(0.7);
      endColor = Cesium.Color.YELLOW.withAlpha(0.3);
    } else if ((type = '喷雾')) {
      Img = fire1Img;
      startColor = Cesium.Color.RED.withAlpha(0.7);
      endColor = Cesium.Color.YELLOW.withAlpha(0.3);
    } else if ((type = '烟雾')) {
      Img = fire1Img;
      startColor = Cesium.Color.RED.withAlpha(0.7);
      endColor = new Cesium.Color.YELLOW.withAlpha(0.3);
    }
    //特效
    var viewer = this.viewer;
    var viewModel = {
      emissionRate: 5,
      gravity: 0.0, //设置重力参数
      minimumParticleLife: 1,
      maximumParticleLife: 6,
      minimumSpeed: 1.0, //粒子发射的最小速度
      maximumSpeed: 4.0, //粒子发射的最大速度
      startScale: 0.0,
      endScale: 10.0,
      particleSize: 25.0
    };
    var emitterModelMatrix = new Cesium.Matrix4();
    var translation = new Cesium.Cartesian3();
    var rotation = new Cesium.Quaternion();
    var hpr = new Cesium.HeadingPitchRoll();
    var trs = new Cesium.TranslationRotationScale();
    var scene = viewer.scene;
    var particleSystem = '';
    var entity = viewer.entities.add({
      //选择粒子放置的坐标
      position: Cesium.Cartesian3.fromDegrees(x, y)
    });
    viewer.clock.shouldAnimate = true;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.trackedEntity = this.entity;
    var particleSystem = scene.primitives.add(
      new Cesium.ParticleSystem({
        image: Img, //生成所需粒子的图片路径
        //粒子在生命周期开始时的颜色
        startColor: startColor,
        //粒子在生命周期结束时的颜色
        endColor: endColor,
        //粒子在生命周期开始时初始比例
        startScale: viewModel.startScale,
        //粒子在生命周期结束时比例
        endScale: viewModel.endScale,
        //粒子发射的最小速度
        minimumParticleLife: viewModel.minimumParticleLife,
        //粒子发射的最大速度
        maximumParticleLife: viewModel.maximumParticleLife,
        //粒子质量的最小界限
        minimumSpeed: viewModel.minimumSpeed,
        //粒子质量的最大界限
        maximumSpeed: viewModel.maximumSpeed,
        //以像素为单位缩放粒子图像尺寸
        imageSize: new Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize),
        //每秒发射的粒子数
        emissionRate: viewModel.emissionRate,
        //粒子系统发射粒子的时间（秒）
        lifetime: 16.0,
        //粒子系统是否应该在完成时循环其爆发
        loop: true,
        //设置粒子的大小是否以米或像素为单位
        sizeInMeters: true,
        //系统的粒子发射器
        emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)) //BoxEmitter 盒形发射器，ConeEmitter 锥形发射器，SphereEmitter 球形发射器，CircleEmitter圆形发射器
      })
    );
    particleSystem = particleSystem;
    preUpdateEvent();
    //场景渲染事件
    function preUpdateEvent() {
      viewer.scene.preUpdate.addEventListener(function (scene, time) {
        //发射器地理位置
        particleSystem.modelMatrix = computeModelMatrix(entity, time);
        //发射器局部位置
        particleSystem.emitterModelMatrix = computeEmitterModelMatrix();
        // 将发射器旋转
        if (viewModel.spin) {
          viewModel.heading += 1.0;
          viewModel.pitch += 1.0;
          viewModel.roll += 1.0;
        }
      });
    }

    function computeModelMatrix(entity, time) {
      return entity.computeModelMatrix(time, new Cesium.Matrix4());
    }

    function computeEmitterModelMatrix() {
      hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr);
      trs.translation = Cesium.Cartesian3.fromElements(-4.0, 0.0, 1.4, translation);
      trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

      return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
    }

    function removeEvent() {
      viewer.scene.preUpdate.removeEventListener(preUpdateEvent, this);
      emitterModelMatrix = undefined;
      translation = undefined;
      rotation = undefined;
      hpr = undefined;
      trs = undefined;
    }

    //移除粒子特效
    function remove() {
      () => {
        return this.removeEvent();
      }; //清除事件
      viewer.scene.primitives.remove(particleSystem); //删除粒子对象
      viewer.entities.remove(entity); //删除entity
    }
  },
  /**
   * 空间分析-淹没分析
   * @param {Array} positions 位置数组
   * @param {Number} waterHeight 当前水位高度
   * @param {Number} targertWaterHeight 目标水位高度
   * @param {Number} speed 水位上升速度
   */
  InduationAnalysis(positions, waterHeight, targertWaterHeight, speed) {
    // 自定义多边形
    if (this.clippingPoints.length > 0) {
      let clippingPoints = this.clippingPoints;
      positions = [];
      //将第一个点添加到最后一个点，完成闭环
      clippingPoints.push(clippingPoints[0]);
      // 将点集合逆转
      let newClippingPoints = clippingPoints.reverse();
      for (let i = 0; i < newClippingPoints.length; i++) {
        positions.push(newClippingPoints[i][0], newClippingPoints[i][1]);
      }
    }
    speed = (speed * (targertWaterHeight - waterHeight)) / 1000;
    var viewer = this.viewer;
    viewer.entities.add({
      id: 'induationAnalysis',
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
        perPositionHeight: true,
        // 使用回调函数Callback，直接设置extrudedHeight会导致闪烁
        extrudedHeight: new Cesium.CallbackProperty(function () {
          waterHeight += speed;
          if (waterHeight > targertWaterHeight) {
            waterHeight = targertWaterHeight;
          }
          return waterHeight;
        }, false),
        material: new Cesium.Color.fromBytes(64, 157, 253, 150)
      }
    });
  },
  /**
   * 空间分析-日照分析
   * @param {Number} speed 速度
   */
  SunShadows(speed) {
    var viewer = this.viewer;
    viewer.scene.globe.enableLighting = true;
    viewer.clock.shouldAnimate = true;
    viewer.shadows = true;
    viewer.clock.multiplier = speed;
  },
  /**
   * 空间分析-通视分析
   */
  VisibilityAnalysis() {
    var handler = this.handler;
    var viewPoints = this.viewPoints;
    var targetPoints = this.targetPoints;
    var viewer = this.viewer;
    var scene = viewer.scene;
    var parentEntity = this.parentEntity;
    var iLength = this.iLength;
    var jLength = this.jLength;
    pickFromRay();
    // 绘制线
    function drawLine(leftPoint, secPoint, color) {
      name: 'line';
      id: 'Line_Sight',
        viewer.entities.add({
          polyline: {
            positions: [leftPoint, secPoint],
            width: 1,
            material: color,
            depthFailMaterial: color
          }
        });
    }

    function readyForDraw(i, j) {
      // 计算射线的方向，目标点left 视域点right
      var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPoints[j], viewPoints[i], new Cesium.Cartesian3()), new Cesium.Cartesian3());
      // 建立射线
      var ray = new Cesium.Ray(viewPoints[i], direction);
      var result = viewer.scene.globe.pick(ray, viewer.scene); // 计算交互点，返回第一个
      showIntersection(result, targetPoints[j], viewPoints[i]);
    }

    function pickFromRay() {
      var i = iLength;
      var j = jLength;
      if (i == viewPoints.length && j == targetPoints.length) {
        return;
      } else if (i == 0 && j == 0) {
        for (; i < viewPoints.length; ++i) {
          //第一次画线
          for (; j < targetPoints.length; ++j) readyForDraw(i, j);
        }
      } else if (i == viewPoints.length && j < targetPoints.length) {
        //重新添加目标点
        for (; j < targetPoints.length; ++j) for (var i = 0; i < viewPoints.length; ++i) readyForDraw(i, j);
      } else if (i < viewPoints.length && j == targetPoints.length) {
        //重新添加视域点
        for (; i < viewPoints.length; ++i) for (var j = 0; j < targetPoints.length; ++j) readyForDraw(i, j);
      }
      iLength = i;
      jLength = j;
    }

    // 处理交互点
    function showIntersection(result, destPoint, viewPoint) {
      // 如果是场景模型的交互点，排除交互点是地球表面
      if (result !== undefined && result !== null) {
        drawLine(result, viewPoint, Cesium.Color.GREEN); // 可视区域
        drawLine(result, destPoint, Cesium.Color.RED); // 不可视区域
      } else {
        drawLine(viewPoint, destPoint, Cesium.Color.GREEN);
      }
    }
  },
  /**
   * 通视分析/可视域分析-添加视域点
   */
  AddViewPoint() {
    var handler = this.handler;
    var viewPoints = this.viewPoints;
    var viewer = this.viewer;
    var that = this;
    var scene = viewer.scene;
    var parentEntity = this.parentEntity;
    if (handler) handler.destroy();
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (e) {
      var position = scene.pickPosition(e.position);
      //将笛卡尔坐标转化为经纬度坐标
      var cartographic = Cesium.Cartographic.fromCartesian(position);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      that.longitude = longitude;
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
      that.latitude = latitude;
      var height = Math.ceil(viewer.camera.positionCartographic.height);
      that.height = height;
      var toPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      viewPoints.push(toPoint);
      viewer.entities.add({
        //添加实体
        parent: parentEntity,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        name: 'vpoint',
        id: 'viewPoint',
        ellipsoid: {
          radii: new Cesium.Cartesian3(10, 10, 10),
          material: Cesium.Color.GREEN
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //单击鼠标右键结束画点
    handler.setInputAction(function (movement) {
      handler.destroy();
      Message({
        type: 'success',
        message: `结束添加视域点`
      });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  },
  /**
   * 通视分析-添加目标点
   */
  AddTargetPoint() {
    var handler = this.handler;
    var targetPoints = this.targetPoints;
    var viewer = this.viewer;
    var scene = viewer.scene;
    var parentEntity = this.parentEntity;
    if (handler) handler.destroy();
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (e) {
      var position = scene.pickPosition(e.position);
      //将笛卡尔坐标转化为经纬度坐标
      var cartographic = Cesium.Cartographic.fromCartesian(position);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
      var height = Math.ceil(viewer.camera.positionCartographic.height);
      var toPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      targetPoints.push(toPoint);

      viewer.entities.add({
        parent: parentEntity,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        name: 'tpoint',
        id: 'targetPoint',
        ellipsoid: {
          radii: new Cesium.Cartesian3(10, 10, 10),
          material: Cesium.Color.RED
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //单击鼠标右键结束画点
    handler.setInputAction(function (movement) {
      handler.destroy();
      Message({
        type: 'success',
        message: `结束添加目标点`
      });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  },
  /**
   * 空间分析-可视域分析
   * @param {Number} verticalViewAngle 垂直视角
   * @param {Number} horizontalViewAngle 水平视角
   * @param {Number} viewHeading 方位角
   * @param {Number} distance 视域距离
   */
  ViewshedAnalysis(verticalViewAngle, horizontalViewAngle, viewHeading, distance) {
    let options = {
      viewPosition: Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height),
      verticalViewAngle: verticalViewAngle,
      horizontalViewAngle: horizontalViewAngle,
      viewHeading: viewHeading,
      viewDistance: distance
    };
    var viewer = this.viewer;
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
  },
  /**
   * 清除视域
   */
  clearHelsing() {
    // for (let i = 0; i < this.viewer.entities.values.length; i++) {
    //   if (this.viewer.entities.values[i].id == "viewPoint") {
    //     this.viewer.entities.remove(this.viewer.entities.values[i]);
    //   }
    // }
    if (this.sketch) {
      this.viewer.entities.removeById('sketch');
      this.sketch = null;
    }
    if (this.frustumOutline) {
      this.frustumOutline.destroy();
      this.frustumOutline = null;
    }
    if (this.postStage) {
      this.viewer.scene.postProcessStages.remove(this.postStage);
      this.postStage = null;
    }
  },
  /**
   * 添加等高线(默认)
   */
  AddContourLines() {
    // 获取viewer对象
    let viewer = this.viewer;
    // 获取场景对象
    let globe = viewer.scene.globe;
    // 等高线材质的uniforms
    let contourUniforms = {};
    // 使用等高线材质
    let material = Cesium.Material.fromType('ElevationContour');
    // 获取材质中的uniforms
    contourUniforms = material.uniforms;
    // 线宽2.0px
    contourUniforms.width = 2.0;
    // 高度间隔为150米
    contourUniforms.spacing = 150;
    // 等高线颜色为红色
    contourUniforms.color = Cesium.Color.RED;
    // 设置材质
    globe.material = material;
  },
  /**
   * 添加等高线(渲染)
   * @param {*} viewModel  等高线参数
   */
  AddContourLinesRender(viewModel) {
    const viewer = this.viewer;
    const gradient = Boolean(viewModel.gradient);
    const band1Position = Number(viewModel.band1Position);
    const band2Position = Number(viewModel.band2Position);
    const band3Position = Number(viewModel.band3Position);
    const bandThickness = Number(viewModel.bandThickness);
    const bandTransparency = Number(viewModel.bandTransparency);
    const backgroundTransparency = Number(viewModel.backgroundTransparency);

    const layers = [];
    const backgroundLayer = {
      entries: [
        {
          height: 4200.0,
          color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency)
        },
        {
          height: 8000.0,
          color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency)
        },
        {
          height: 8500.0,
          color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency)
        }
      ],
      extendDownwards: true,
      extendUpwards: true
    };
    layers.push(backgroundLayer);

    const gridStartHeight = 4200.0;
    const gridEndHeight = 8848.0;
    const gridCount = 50;
    for (let i = 0; i < gridCount; i++) {
      const lerper = i / (gridCount - 1);
      const heightBelow = Cesium.Math.lerp(gridStartHeight, gridEndHeight, lerper);
      const heightAbove = heightBelow + 10.0;
      const alpha = Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
      layers.push({
        entries: [
          {
            height: heightBelow,
            color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
          },
          {
            height: heightAbove,
            color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
          }
        ]
      });
    }

    const antialias = Math.min(10.0, bandThickness * 0.1);

    if (!gradient) {
      const band1 = {
        entries: [
          {
            height: band1Position - bandThickness * 0.5 - antialias,
            color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
          },
          {
            height: band1Position - bandThickness * 0.5,
            color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
          },
          {
            height: band1Position + bandThickness * 0.5,
            color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
          },
          {
            height: band1Position + bandThickness * 0.5 + antialias,
            color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
          }
        ]
      };

      const band2 = {
        entries: [
          {
            height: band2Position - bandThickness * 0.5 - antialias,
            color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
          },
          {
            height: band2Position - bandThickness * 0.5,
            color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
          },
          {
            height: band2Position + bandThickness * 0.5,
            color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
          },
          {
            height: band2Position + bandThickness * 0.5 + antialias,
            color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
          }
        ]
      };

      const band3 = {
        entries: [
          {
            height: band3Position - bandThickness * 0.5 - antialias,
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
          },
          {
            height: band3Position - bandThickness * 0.5,
            color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
          },
          {
            height: band3Position + bandThickness * 0.5,
            color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
          },
          {
            height: band3Position + bandThickness * 0.5 + antialias,
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
          }
        ]
      };

      layers.push(band1);
      layers.push(band2);
      layers.push(band3);
    } else {
      const combinedBand = {
        entries: [
          {
            height: band1Position - bandThickness * 0.5,
            color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
          },
          {
            height: band2Position,
            color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
          },
          {
            height: band3Position + bandThickness * 0.5,
            color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
          }
        ]
      };

      layers.push(combinedBand);
    }

    const material = Cesium.createElevationBandMaterial({
      scene: viewer.scene,
      layers: layers
    });
    viewer.scene.globe.material = material;
  },
  /**
   * 空间分析-剖面分析
   */
  ProfileAnalysis() {
    //全局变量
    var dom = document.getElementById('mainChart'); // 绘图对象 // 绘图对象
    var myChart = null;
    var start = null;
    var end = null;
    var viewer = this.viewer;
    //画点
    function drawPoint(position) {
      viewer.entities.add({
        position: position,
        point: {
          size: 10,
          color: Cesium.Color.GREEN
        }
      });
    }
    //画线
    function drawLine() {
      viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return [start, end];
          }),
          material: Cesium.Color.RED,
          clampToGround: true,
          classificationType: Cesium.ClassificationType.BOTH
        }
      });
    }
    //开始绘制
    function beginDraw() {
      // 重置
      $('#mainChart').hide();
      viewer.entities.removeAll();
      start = null;
      end = null;
      viewer.screenSpaceEventHandler.setInputAction(function (clickEvent) {
        if (start == null) {
          start = viewer.scene.pickPosition(clickEvent.position);
          drawPoint(start);
          viewer.screenSpaceEventHandler.setInputAction(function (moveEvent) {
            end = viewer.scene.pickPosition(moveEvent.endPosition);
            drawLine();
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else {
          end = viewer.scene.pickPosition(clickEvent.position);
          drawPoint(end);
          viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          profileAnalyse();
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    //高度分析
    function profileAnalyse() {
      var positions = [Cesium.Cartographic.fromCartesian(start)];
      var terrainProvider = viewer.terrainProvider;
      // 插值100个点，点越多模拟越精确，但是效率会低
      var count = 100;
      for (var i = 1; i < count; i++) {
        var cart = Cesium.Cartesian3.lerp(start, end, i / count, new Cesium.Cartesian3());
        positions.push(Cesium.Cartographic.fromCartesian(cart));
      }
      positions.push(Cesium.Cartographic.fromCartesian(end));

      // 异步使用最精确的地形采样获取地形高度
      var value = [];
      new Promise((resolve, reject) => {
        value = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
        resolve(value);
      }).then(updatedPositions => {
        // 因为new Promise返回的就是一个promise对象实例，所以这里可以链式操作
        // 处理返回的数据
        var height = [];
        for (var i = 0; i < updatedPositions.length; i++) {
          height.push(updatedPositions[i].height); // 取得高程值
        }

        // 绘制高程走势图
        dom.style.display = 'block';

        // 使用Echart等图表工具可视化
        if (myChart == null) {
          myChart = echarts.init(dom);
          initChart(height, false);
        } else {
          initChart(height, true);
        }
      });
    }
    //初始化图表
    function initChart(height, isMerge) {
      var option = {
        title: {
          text: '地形剖面图'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['地形剖面']
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '海拔走势图',
            type: 'line',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            areaStyle: {
              normal: {}
            },
            data: height
          }
        ]
      };
      myChart.setOption(option, isMerge);
    }
    beginDraw();
  },
  /**
   * 生成竖直管道
   * @param {String} id 实体id
   *  @param {Array} positions 实体经纬度[经度, 纬度]
   * @param {Number} height 实体据地面高度，默认为0
   * @param {Number} pipeRadius 管道外径，默认外径0.8、内径为外径的2/3
   * @param {Number} pipeHeight 管道高度， 默认为1.5
   * @param {Number} waterHeight 管道内水高， 默认为0
   * @returns 竖直管道管理对象
   */
  VerticalPipe(id, positions, height, pipeRadius, pipeHeight, waterHeight) {
    var pipeEntityCollection = this.viewer;
    let pipe; // 存储管道实体
    let water; // 存储水实体

    /**
     * 管道截面形状计算，根据中心点和半径生成圆形
     * @param {Array} initialPosition [经度, 纬度]
     * @param {Number} radius 截面半径
     * @returns 组成截面的点集合
     */
    function computeCircle(initialPosition, radius) {
      let Ea = 6378137; //   赤道半径
      let Eb = 6356725; // 极半径
      let positionArr = [];
      //cesium正东是0°
      for (let i = 0; i <= 360; i++) {
        let dx = radius * Math.sin((i * Math.PI) / 180.0);
        let dy = radius * Math.cos((i * Math.PI) / 180.0);

        let ec = Eb + ((Ea - Eb) * (90.0 - initialPosition[1])) / 90.0;
        let ed = ec * Math.cos((initialPosition[1] * Math.PI) / 180);

        let BJD = initialPosition[0] + ((dx / ed) * 180.0) / Math.PI; // 圆弧点经度
        let BWD = initialPosition[1] + ((dy / ec) * 180.0) / Math.PI; // 圆弧点纬度

        positionArr.push(BJD);
        positionArr.push(BWD);
      }
      return positionArr;
    }

    // 管道实体
    pipe = pipeEntityCollection.entities.add({
      id: `node_pipe_${id}`,
      name: 'pipe',
      position: Cesium.Cartesian3.fromDegrees(positions[0], positions[1]),
      polygon: {
        hierarchy: {
          positions: Cesium.Cartesian3.fromDegreesArray(computeCircle(positions, pipeRadius ? pipeRadius : 0.8)),
          holes: [
            {
              positions: Cesium.Cartesian3.fromDegreesArray(computeCircle(positions, pipeRadius ? (pipeRadius * 3) / 4 : 0.6))
            }
          ]
        },
        height: height ? height : 0.0,
        extrudedHeight: height ? (pipeHeight ? height + pipeHeight : height + 1.5) : pipeHeight ? pipeHeight : 1.5,
        material: Cesium.Color.GREEN.withAlpha(0.5)
      }
    });

    // 管道内水实体
    water = pipeEntityCollection.entities.add({
      id: `node_water_${id}`,
      name: 'water in the pipe',
      position: Cesium.Cartesian3.fromDegrees(positions[0], positions[1]),
      polygon: {
        hierarchy: {
          positions: Cesium.Cartesian3.fromDegreesArray(computeCircle(positions, pipeRadius ? (pipeRadius * 3) / 4 : 0.6))
        },
        height: height ? height : 0.0,
        extrudedHeight: height ? (waterHeight ? height + waterHeight : height) : waterHeight ? waterHeight : 0,
        material: waterHeight && waterHeight != 0 ? Cesium.Color.BLUE.withAlpha(0.9) : Cesium.Color.TRANSPARENT
      }
    });

    // 初始化水的高度
    if (waterHeight) setWaterHeight(waterHeight);

    // 改变水位高度
    function setWaterHeight(value) {
      let initialHeight = height ? height : 0.0;
      value += initialHeight;
      const tempHeight = height ? (pipeHeight ? height + pipeHeight : height + 1.5) : pipeHeight ? pipeHeight : 1.5;
      if (water.polygon.material.getValue().color.alpha == 0) {
        water.polygon.material = Cesium.Color.BLUE.withAlpha(0.9);
      }
      if (value >= tempHeight) {
        water.polygon.extrudedHeight.setValue(tempHeight);
        pipe.polygon.material = Cesium.Color.RED.withAlpha(0.5);
        return -1;
      }

      water.polygon.extrudedHeight.setValue(value);
      return 0;
    }
    // 获得水位高度
    function getWaterHeight() {
      let totalHeight = parseFloat(water.polygon.extrudedHeight.getValue());
      let initialHeight = height ? height : 0.0;
      return totalHeight - initialHeight;
    }
    // 重置水位高度
    function initWaterHeight() {
      water.polygon.extrudedHeight.setValue(height ? height : 0.0);
      pipe.polygon.material = Cesium.Color.GREEN.withAlpha(0.5);
    }
    // 返回对象
    return {
      pipe,
      water,
      setWaterHeight,
      getWaterHeight,
      initWaterHeight
    };
  },
  /**
   * 生成水平管道
   * @param {String} id 实体id
   * @param {Array} positions 组成管道的点集合[..., 经度, 纬度, 高度, ...]
   * @param {"single" | "both" | "null"} cut 为避免水平管道与垂直管道重叠对水平管道进行裁切，默认不裁切
   * @param {1 | 2 | 3 | 4} status 管道内水位状态， 默认为1
   * @param {Number} pipeRadius 管道外径，默认为0.4、内径为外径的2/3
   * @returns 水平管道管理对象
   */
  HorizontalPipe(id, positions, cut, status, pipeRadius) {
    var pipeEntityCollection = this.viewer;
    let pipe; // 管道对象
    let water; // 水体对象
    let _cut = cut ? cut : 'null'; // 裁切方法
    let _status = status ? status : 1; // 管道内水位状态

    /**
     * 管道截面形状计算，分为四个阶段：1/4弧、半圆、3/4弧、整圆
     * @param {Number} radius 半径
     * @param {Number} status 截面阶段
     * @returns 组成截面的点集合
     */
    function computeCircle(radius, status) {
      var positions = [];
      let startRad, endRad;
      // 水位截面角度
      switch (status) {
        case 1:
          startRad = 225;
          endRad = 315;
          break;
        case 2:
          startRad = 180;
          endRad = 360;
          break;
        case 3:
          startRad = 135;
          endRad = 405;
          break;
        case 4:
          startRad = 0;
          endRad = 360;
          break;
        default:
          for (let i = 360; i >= 0; i--) {
            let radians = Cesium.Math.toRadians(i);
            positions.push(new Cesium.Cartesian2(insRadius * Math.cos(radians), insRadius * Math.sin(radians)));
          }
      }

      for (let i = startRad; i <= endRad; i++) {
        let radians = Cesium.Math.toRadians(i);
        positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
      }

      return positions;
    }

    /**
     * 避免水平管道与垂直管道重叠，重新计算初末位置
     * @param {"pipe" | "water"} type  管道或者水体
     * @param {"single" | "both" | "null"} cut 单侧裁切、两侧裁切、不裁切
     * @returns {Array} cartesianPositions
     */
    function computePos(type, cut) {
      let waterPositions = positions.concat();
      let cartesianPositions;
      if (type == 'water') {
        for (let i = 2; i < waterPositions.length; i += 3) {
          waterPositions[i] += 0.4 - 0.25;
        }
        cartesianPositions = new Cesium.Cartesian3.fromDegreesArrayHeights(waterPositions);
      } else if (type == 'pipe') {
        cartesianPositions = new Cesium.Cartesian3.fromDegreesArrayHeights(positions);
      }
      const start = cartesianPositions[0];
      const second = cartesianPositions[1];
      const end = cartesianPositions[cartesianPositions.length - 1];
      const secondToLast = cartesianPositions[cartesianPositions.length - 2];
      const startLength = Math.sqrt(Math.pow(start.x - second.x, 2) + Math.pow(start.y - second.y, 2) + Math.pow(start.z - second.z, 2));
      const endLength = Math.sqrt(Math.pow(secondToLast.x - end.x, 2) + Math.pow(secondToLast.y - end.y, 2) + Math.pow(secondToLast.z - end.z, 2));
      const startOffsetX = (0.7 / startLength) * (second.x - start.x);
      const startOffsetY = (0.7 / startLength) * (second.y - start.y);
      const startOffsetZ = (0.7 / startLength) * (second.z - start.z);
      const endOffsetX = (0.7 / endLength) * (secondToLast.x - end.x);
      const endOffsetY = (0.7 / endLength) * (secondToLast.y - end.y);
      const endOffsetZ = (0.7 / endLength) * (secondToLast.z - end.z);

      if (cut == 'single') {
        start.x += startOffsetX;
        start.y += startOffsetY;
        start.z += startOffsetZ;
      }
      if (cut == 'both') {
        start.x += startOffsetX;
        start.y += startOffsetY;
        start.z += startOffsetZ;
        end.x += endOffsetX;
        end.y += endOffsetY;
        end.z += endOffsetZ;
      }

      return cartesianPositions;
    }

    // 管道实体
    pipe = pipeEntityCollection.entities.add({
      id: `link_pipe_${id}`,
      name: 'link pipe',
      polylineVolume: {
        positions: computePos('pipe', _cut),
        // positions: new Cesium.Cartesian3.fromDegreesArrayHeights(startPos.concat(endPos)),
        shape: computeCircle(pipeRadius ? pipeRadius : 0.4, 4),
        material: Cesium.Color.GREEN.withAlpha(0.5)
      }
    });

    // 管道内水实体
    water = pipeEntityCollection.entities.add({
      id: `link_water_${id}`,
      name: 'water in the pipe',
      polylineVolume: {
        positions: computePos('water', _cut),
        // positions: new Cesium.Cartesian3.fromDegreesArrayHeights(waterStartPos.concat(waterEndPos)),
        shape: computeCircle(pipeRadius ? (pipeRadius * 2) / 3 : 0.25, _status),
        material: Cesium.Color.BLUE.withAlpha(0.9)
      }
    });

    // 初始化水位高度
    if (status) setStatus(status);

    // 获取水位高度
    function getStatus() {
      return _status;
    }

    // 设置水位高度
    function setStatus(value) {
      let res = 0;
      if (value >= 4) {
        value = 4;
        res = -1;
        pipe.polylineVolume.material = Cesium.Color.RED.withAlpha(0.5);
      }
      water.polylineVolume.shape = computeCircle(pipeRadius ? (pipeRadius * 2) / 3 : 0.25, value);
      _status = value;
      return res;
    }

    // 重置水位高度
    function initStatus() {
      pipe.polylineVolume.material = Cesium.Color.GREEN.withAlpha(0.5);
      water.polylineVolume.shape = computeCircle(pipeRadius ? (pipeRadius * 2) / 3 : 0.25, 1);
      _status = 1;
    }
    console.log(pipe);
    return {
      pipe,
      water,
      getStatus,
      setStatus,
      initStatus
    };
  },
  /**
   * 创建裁剪面
   * @param {Number} baseHeight 底面的高度
   */
  clippings(baseHeight) {
    let that = this;
    var viewer = this.viewer;
    let clippingPoints = that.clippingPoints;
    //将第一个点添加到最后一个点，完成闭环
    clippingPoints.push(clippingPoints[0]);
    // 将点集合逆转
    let newClippingPoints = clippingPoints.reverse();
    // truf判断多边形坐标是否为顺时针，true：顺时针，false：逆时针
    // console.log(turf.booleanClockwise(turf.lineString(clippingPoints)));
    let clippingPlanes1 = that.createClippingPlane(newClippingPoints, baseHeight);

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes1,
      edgeWidth: 1.0,
      edgeColor: Cesium.Color.YELLOW
    });
    return newClippingPoints;
  },
  /**
   * 画开挖面顶点
   * @param {Array} position 顶点坐标
   * @param {Object} config 配置
   * @param {Viewer} viewer 视图
   * @returns {Entity} 返回点对象
   */
  drawPoint(position, config, viewer) {
    let config_ = config ? config : {};
    return viewer.entities.add({
      name: '点几何对象',
      position: position,
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
  },
  /**
   * 画线
   * @param {Array} positions 线的坐标集合
   * @param {Object} config 线的配置
   * @param {Viewer} viewer 视图
   * @returns {Entity} 返回线对象
   */

  drawPolyline(positions, config_, viewer) {
    if (positions.length < 1) return;
    let config = config_ ? config_ : {};
    return viewer.entities.add({
      name: '线几何对象',
      polyline: {
        positions: positions,
        width: config.width ? config.width : 5.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: config.color ? new Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD
        }),
        depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
          color: config.color ? new Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD
        }),
        clampToGround: true
      }
    });
  },
  /**
   * 裁剪多边形（点和线）
   */
  draw: function () {
    let that = this;
    let viewer = this.viewer;
    this.clippingPoints = [];
    let tempEntities = this.tempEntities;
    let position = [];
    let tempPoints = [];
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //鼠标移动事件
    handler.setInputAction(function (movement) {}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //左键点击操作
    handler.setInputAction(function (click) {
      // 从相机位置通过windowPosition 世界坐标中的像素创建一条射线。返回Cartesian3射线的位置和方向。
      let ray = viewer.camera.getPickRay(click.position);
      // 查找射线与渲染的地球表面之间的交点。射线必须以世界坐标给出。返回Cartesian3对象
      position = viewer.scene.globe.pick(ray, viewer.scene);
      //将笛卡尔坐标转换为地理坐标
      let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
      //将弧度转为度的十进制度表示
      let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
      let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
      let points = [longitudeString, latitudeString, cartographic.height];
      // 将点坐标添加到数组中
      that.clippingPoints.push(points);
      tempPoints.push(position);
      let tempLength = tempPoints.length;
      //调用绘制点的接口
      let point = that.drawPoint(position, null, viewer);
      tempEntities.push(point);
      if (tempLength > 1) {
        let pointline = that.drawPolyline([tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1]], null, viewer);
        tempEntities.push(pointline);
      } else {
        // tooltip.innerHTML = "请绘制下一个点，右键结束";
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击操作
    handler.setInputAction(function (click) {
      let cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);

      if (cartesian) {
        let tempLength = tempPoints.length;
        if (tempLength < 3) {
          alert('请选择3个以上的点再执行闭合操作命令');
        } else {
          //闭合最后一条线
          let pointline = that.drawPolyline([tempPoints[tempPoints.length - 1], tempPoints[0]], null, viewer);
          tempEntities.push(pointline);
          tempEntities.push(tempPoints);
          handler.destroy(); //关闭事件句柄
          handler = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  },
  /**
   * 根据多边形数组创建裁切面
   * @param points_ 多边形数组集合
   * @returns {[]} 返回裁切面数组
   */
  createClippingPlane(points_, baseHeight) {
    var viewer = this.viewer;
    let points = [];
    let pointHeights = [];
    var maxHeights = [];
    var minHeights = [];
    var wellWall = [];

    for (let i = 0; i < points_.length - 1; i++) {
      points.push(Cesium.Cartesian3.fromDegrees(points_[i][0], points_[i][1]));
      pointHeights.push(points_[i][0], points_[i][1]);
    }
    pointHeights.push(points_[points_.length - 1][0], points_[points_.length - 1][1]);
    // 设置高度
    for (let i = 0; i < points_.length; i++) {
      if (points_[i][2] >= baseHeight) {
        maxHeights.push(points_[i][2]);
        minHeights.push(baseHeight);
      } else {
        maxHeights.push(baseHeight);
        minHeights.push(points_[i][2]);
      }
    }
    // 底部
    this.viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(pointHeights),
        material: new Cesium.ImageMaterialProperty({
          image: bottomdzImg
        }),
        closeTop: false, // 这个要设置为false
        extrudedHeight: baseHeight,
        perPositionHeight: true // 这个要设置true
      }
    });
    // 侧面墙
    let wall = new Cesium.WallGeometry({
      positions: Cesium.Cartesian3.fromDegreesArray(pointHeights),
      // // 设置高度
      maximumHeights: maxHeights,
      minimunHeights: minHeights
    });
    let geometry = Cesium.WallGeometry.createGeometry(wall);
    var a = new Cesium.Material({
        fabric: {
          type: 'Image',
          uniforms: {
            image: excavateImg
          }
        }
      }),
      n = new Cesium.MaterialAppearance({
        translucent: !1,
        flat: !0,
        material: a
      });
    (wellWall = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
        },
        id: 'PitWall'
      }),
      appearance: n,
      asynchronous: !1
    })),
      this.viewer.scene.primitives.add(wellWall);

    let pointsLength = points.length;
    let clippingPlanes = []; // 存储ClippingPlane集合
    for (let i = 0; i < pointsLength; ++i) {
      let nextIndex = (i + 1) % pointsLength;
      let midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
      midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

      let up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
      let right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
      right = Cesium.Cartesian3.normalize(right, right);

      let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
      normal = Cesium.Cartesian3.normalize(normal, normal);
      let originCenteredPlane = new Cesium.Plane(normal, 0.0);
      let distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);

      clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
    }
    return clippingPlanes;
  },
  /**
   * 计算三角形的坡度
   * @param {*} point1
   * @param {*} point2
   * @param {*} point3
   * @returns
   */
  calculateSlopeAndAspect(point1, point2, point3) {
    // 计算两个向量，它们位于三角形的两边
    var v1 = Cesium.Cartesian3.subtract(point1, point2, new Cesium.Cartesian3());
    var v2 = Cesium.Cartesian3.subtract(point2, point3, new Cesium.Cartesian3());
    // 计算这两个向量的叉积，得到三角形的法向量
    var normal = new Cesium.Cartesian3();
    Cesium.Cartesian3.cross(v1, v2, normal);
    Cesium.Cartesian3.normalize(normal, normal);
    // 计算坡度：法向量和垂直向量（0,0,1）之间的夹角
    var up = new Cesium.Cartesian3(0, 0, 1);
    var slopeRadians = Math.acos(Cesium.Cartesian3.dot(normal, up));
    var slopeDegrees = Cesium.Math.toDegrees(slopeRadians);
    // 如果坡度大于90度，则将其减少到90度以下
    if (slopeDegrees > 90) {
      slopeDegrees = 180 - slopeDegrees;
    }
    // 返回坡度值
    return { slope: slopeDegrees };
  },
  /**
   * 根据地形和矩形区域生成三角网（坡向）
   * @param {Array} resultPoints 矩形区域的四个点
   * @param {Number} num 生成的三角网横向/纵向点数
   * @param {Number} h   生成的三角网提升的高度
   */
  //根据地形和矩形区域生成三角网
  GeneratingTriangulation(resultPoints, num, h) {
    let viewer = this.viewer;
    let that = this;
    // 1. 创建一个矩形区域
    // var rectangle = Cesium.Rectangle.fromDegrees(117.09649937089316, 36.20673458245797, 117.11797117691083, 36.230040948473906)
    var rectangle = Cesium.Rectangle.fromDegrees(resultPoints[0].lng, resultPoints[2].lat, resultPoints[2].lng, resultPoints[0].lat);
    // 2. 在这个矩形区域内生成点集
    var width = num; // 横向点数
    var height = num; // 纵向点数
    var terrainProvider = viewer.terrainProvider;
    var positions = [];
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var longitude = Cesium.Math.lerp(rectangle.west, rectangle.east, x / (width - 1));
        var latitude = Cesium.Math.lerp(rectangle.south, rectangle.north, y / (height - 1));
        positions.push(Cesium.Cartographic.fromRadians(longitude, latitude));
      }
    }
    // 3. 获取点集的高程信息
    Cesium.sampleTerrainMostDetailed(terrainProvider, positions).then(function (samples) {
      var points = samples.map(function (sample) {
        return turf.point([Cesium.Math.toDegrees(sample.longitude), Cesium.Math.toDegrees(sample.latitude), sample.height], { z: sample.height }); // 将高度值保存到名为 'z' 的属性中);
      });
      // 创建一个FeatureCollection
      var featureCollection = turf.featureCollection(points);
      var tin = turf.tin(featureCollection, 'z');
      var geometryInstances = []; // 用于存放所有的三角形GeometryInstance
      var instances = [];
      // 遍历每个TIN三角形
      tin.features.forEach(function (feature, i) {
        var coordinates = feature.geometry.coordinates[0];
        var heights = [feature.properties.a, feature.properties.b, feature.properties.c];
        // 将三角形的三个顶点转换为笛卡尔坐标
        var positions = coordinates.map(function (coord, index) {
          return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], heights[index] + h);
        });
        const point1 = positions[0];
        const point2 = positions[1];
        const point3 = positions[2];
        //使用我们新定义的函数计算每个三角形的坡度
        var analysisResult = that.calculateSlopeAndAspect(point1, point2, point3);
        var slope = analysisResult.slope;
        var hue = slope / 90.0; // 将坡度从0到90度映射到色调从0到1
        var saturation = 1.0; // 全饱和度
        var lightness = 0.5; // 正常亮度
        var alpha = 1.0; // 完全不透明
        //将HSL颜色转换为RGBA，当坡度为0度时，hue变为0，颜色是红色；当坡度为90度时，hue变为1，颜色是绿色；在0到90度之间的坡度将映射到从红色到绿色之间的颜色。
        var color = Cesium.Color.fromHsl(hue, saturation, lightness).withAlpha(alpha);

        //添加三角面
        viewer.entities.add({
          name: '三角面',
          id: 'triangle' + i,
          polygon: {
            hierarchy: [positions[0], positions[1], positions[2]],
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            perPositionHeight: true,
            // material: Cesium.Color.fromCssColorString("#23B8BA").withAlpha(
            //   1.0
            // ),
            material: color,
            //  extrudedHeight: 0,
            outline: true,
            outlineColor: Cesium.Color.GREEN
          }
        });
        // 添加三角形的三个顶点
        var topPositions = coordinates.map(function (coord, index) {
          return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], heights[index] + h - 200);
        });
        // 添加顶面
        viewer.entities.add({
          name: '顶面',
          id: '顶面' + i,
          polygon: {
            hierarchy: [topPositions[0], topPositions[1], topPositions[2]],
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            perPositionHeight: true,
            material: Cesium.Color.YELLOW.withAlpha(1),
            outline: true,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.5)
          }
        });
        // 设置底部高度
        var baseHeight = 500;
        // 底部三角形的三个顶点（X,Y坐标与顶部三角形相同，但高度为固定值）
        const bottomPositions = coordinates.map(function (coord) {
          return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], baseHeight);
        });

        // 添加三个侧面
        for (var j = 0; j < topPositions.length - 1; j++) {
          const next = (j + 1) % 3; // 确保最后一个顶点与第一个顶点连接
          console.log(positions[j]);
          // 当前侧面的四个顶点
          const sidePositions = [topPositions[j], topPositions[next], bottomPositions[next], bottomPositions[j]];

          viewer.entities.add({
            name: '侧面' + j,
            id: 'sideWall' + i + '_' + j,
            polygon: {
              hierarchy: sidePositions,
              perPositionHeight: true,
              material: Cesium.Color.YELLOW.withAlpha(1),
              outline: true,
              outlineColor: Cesium.Color.BLACK.withAlpha(0.5)
            }
          });
        }
        // 添加底部三角形
        viewer.entities.add({
          name: '底面',
          id: 'bottomFace' + i,
          polygon: {
            hierarchy: bottomPositions,
            perPositionHeight: true,
            material: Cesium.Color.YELLOW.withAlpha(1),
            outline: true,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.5)
          }
        });
      });

      // 生成点
      var cartesianPoints = points.map(function (point) {
        var coord = point.geometry.coordinates;
        var cartographic = Cesium.Cartographic.fromDegrees(coord[0], coord[1], coord[2]);
        return Cesium.Cartographic.toCartesian(cartographic);
      });
      var pointCollection = new Cesium.PointPrimitiveCollection();

      cartesianPoints.forEach(function (position) {
        pointCollection.add({
          position: position,
          color: Cesium.Color.RED,
          pixelSize: 5
        });
      });
      console.log(1);
      viewer.scene.primitives.add(pointCollection);

      // const coordinates = cartesianPoints.map(point => {
      //   return Cesium.Cartographic.fromCartesian(point);
      // }).map(cartographic => {
      //   return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
      // });

      // const delaunay = Delaunay.from(coordinates);
      // const triangles = delaunay.triangles;

      // var geometryInstances = [];

      // for (let i = 0; i < triangles.length; i += 3) {
      //   geometryInstances.push(new Cesium.GeometryInstance({
      //     geometry: new Cesium.PolygonGeometry({
      //       polygonHierarchy: new Cesium.PolygonHierarchy([
      //         cartesianPoints[triangles[i]],
      //         cartesianPoints[triangles[i + 1]],
      //         cartesianPoints[triangles[i + 2]]
      //       ]),
      //       vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      //       height:1000
      //     }),
      //     attributes: {
      //       color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
      //     }
      //   }));
      // }
      // var tin = turf.tin(points, 'z');

      // viewer.scene.primitives.add(new Cesium.Primitive({
      //   geometryInstances: geometryInstances,
      //   appearance: new Cesium.PerInstanceColorAppearance({
      //     flat: true,
      //     translucent: false
      //   })
      // }));
    });
  },
  /**
   * 销毁全局hanlder
   */
  destroyHandler() {
    let handler = this.globalHandler;
    if (handler != null) {
      console.log(handler);
      handler.destroy();
      handler = null;
    }
  },
  /**
   * 绘制点
   */
  DrawPoints() {
    return new Promise((resolve, reject) => {
      let viewer = this.viewer;
      let drawnPoints = [];
      this.destroyHandler();
      // 创建一个事件处理器
      this.globalHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      let handler = this.globalHandler;
      // 注册鼠标左键点击事件，用于绘制点
      handler.setInputAction(event => {
        // 获取鼠标点击的笛卡尔坐标(鼠标点击位置->笛卡尔坐标)
        var cartesian = this.getCatesian3FromPX(event.position);
        // 确保坐标有效
        if (cartesian) {
          // 添加点实体
          viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 10
            }
          });

          // 获取地理坐标（经纬度）
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let height = Cesium.Math.toDegrees(cartographic.height);
          // 将绘制的点添加到数组中
          drawnPoints.push({ lng: longitude, lat: latitude, height: height });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 注册鼠标右键点击事件，用于结束绘制
      handler.setInputAction(() => {
        // 销毁事件处理器
        handler.destroy();

        // 返回所有绘制的点
        resolve(drawnPoints);
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    });
  },
  /**
   * 绘制折线
   */
  DrawPolyline() {
    return new Promise((resolve, reject) => {
      let viewer = this.viewer;
      let polylinePoints = [];

      // 临时折线实体
      let polylineEntity = viewer.entities.add({
        Id: 'drawingPolyline',
        name: '画线',
        polyline: {
          //使用CallbackProperty允许我们在用户点击时动态更新线段的位置
          positions: new Cesium.CallbackProperty(() => {
            return polylinePoints;
          }, false),
          width: 2,
          material: Cesium.Color.RED
        }
      });

      // 临时动态线实体
      let dynamicLineEntity = viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            if (lastPoint && currentMousePoint) {
              return [lastPoint, currentMousePoint];
            } else {
              return [];
            }
          }, false),
          width: 2,
          material: Cesium.Color.RED.withAlpha(0.5) // 使用半透明红色，与主线区分
        }
      });

      let lastPoint = null;
      let currentMousePoint = null;

      this.destroyHandler();
      // 创建一个事件处理器
      this.globalHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      let handler = this.globalHandler;

      // 注册鼠标左键点击事件，用于添加点和显示点
      handler.setInputAction(event => {
        let cartesian = this.getCatesian3FromPX(event.position);
        if (cartesian) {
          polylinePoints.push(cartesian);
          lastPoint = cartesian;

          viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.BLUE,
              pixelSize: 10
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 鼠标移动事件，更新当前鼠标位置并重绘临时线
      handler.setInputAction(event => {
        currentMousePoint = this.getCatesian3FromPX(event.endPosition);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 注册鼠标右键点击事件，用于结束绘制
      handler.setInputAction(() => {
        handler.destroy();
        viewer.entities.remove(dynamicLineEntity); // 移除临时线

        resolve(polylinePoints);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    });
  },
  /**
   * 绘制圆形
   */
  DrawCircle() {
    return new Promise((resolve, reject) => {
      let viewer = this.viewer;
      let centerPoint = null;
      let centerPointEntity = null; // 用于存储中点实体的引用
      let radius = 10;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      let drawingCircle = viewer.entities.add({
        id: 'drawingCircle',
        name: '画圆',
        ellipse: {
          semiMinorAxis: new Cesium.CallbackProperty(() => {
            return radius;
          }, false),
          semiMajorAxis: new Cesium.CallbackProperty(() => {
            return radius;
          }, false),
          material: Cesium.Color.BLUE.withAlpha(0.2),
          outline: true,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 2,
          fill: true //为true时只显示轮廓线
        }
      });

      this.destroyHandler();
      // 创建一个事件处理器
      this.globalHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      let handler = this.globalHandler;

      handler.setInputAction(event => {
        var cartesian = this.getCatesian3FromPX(event.position);
        if (cartesian && centerPoint === null) {
          centerPoint = cartesian;
          drawingCircle.position = centerPoint;

          // 添加中点实体并保存其引用
          centerPointEntity = viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 10
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction(event => {
        if (centerPoint) {
          let cartesian = this.getCatesian3FromPX(event.endPosition);
          if (cartesian) {
            let distance = Cesium.Cartesian3.distance(centerPoint, cartesian);
            radius = distance;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        if (centerPoint !== null && radius > 0) {
          handler.destroy(); // 关闭鼠标事件监听，结束绘制

          let circleCenter = Cesium.Cartographic.fromCartesian(centerPoint);
          let lng = Cesium.Math.toDegrees(circleCenter.longitude);
          let lat = Cesium.Math.toDegrees(circleCenter.latitude);

          resolve({
            center: { lng: lng, lat: lat },
            radius: radius
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    });
  },
  /**
   * 绘制矩形
   */

  DrawRectangle() {
    var allPoints = [];
    // 设置返回值
    return new Promise((resolve, reject) => {
      let viewer = this.viewer;
      let topLeftPoint = null;
      let bottomRightPoint = null;

      let drawingRectangle = viewer.entities.add({
        id: 'drawingRectangle',
        name: '画矩形',
        rectangle: {
          coordinates: new Cesium.CallbackProperty(() => {
            if (topLeftPoint === null || bottomRightPoint === null) {
              return;
            }
            let west = topLeftPoint.longitude;
            let north = topLeftPoint.latitude;
            let east = bottomRightPoint.longitude;
            let south = bottomRightPoint.latitude;
            return new Cesium.Rectangle(west, south, east, north);
          }, false),
          material: Cesium.Color.BLUE.withAlpha(0.2),
          closeTop: true,
          closeBottom: false
        }
      });

      this.destroyHandler();
      // 创建一个事件处理器
      this.globalHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      let handler = this.globalHandler;

      handler.setInputAction(event => {
        var cartesian = this.getCatesian3FromPX(event.position);
        if (cartesian) {
          if (topLeftPoint === null) {
            topLeftPoint = Cesium.Cartographic.fromCartesian(cartesian);
          }

          viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 10
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction(event => {
        if (topLeftPoint) {
          bottomRightPoint = Cesium.Cartographic.fromCartesian(this.getCatesian3FromPX(event.endPosition));
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        if (topLeftPoint !== null && bottomRightPoint !== null) {
          handler.destroy(); // 关闭鼠标事件监听，结束绘制

          let west = Cesium.Math.toDegrees(topLeftPoint.longitude);
          let north = Cesium.Math.toDegrees(topLeftPoint.latitude);
          let east = Cesium.Math.toDegrees(bottomRightPoint.longitude);
          let south = Cesium.Math.toDegrees(bottomRightPoint.latitude);

          allPoints.push({ lng: west, lat: north });
          allPoints.push({ lng: east, lat: north });
          allPoints.push({ lng: east, lat: south });
          allPoints.push({ lng: west, lat: south });
          allPoints.push(allPoints[0]); // 闭合
          resolve(allPoints);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    });
  },
  /**
   * 绘制多边形
   * @param {Object}  option
   * @param {Boolean} option.ground 是否贴地
   */

  DrawPolygon_two(option) {
    // 返回值
    var allPoints = [];
    // 拖拽点实体数组
    var pointEntities = [];
    // 设置返回值
    return new Promise((resolve, reject) => {
      // 1. 获取Cesium Viewer
      let viewer = this.viewer;
      // 2. 创建一个用于存储多边形顶点的数组
      let polygonPoints = [];
      // 3. 创建一个用于显示当前绘制中的多边形的实体
      let drawingPolygon = viewer.entities.add({
        id: 'drawingPolygon',
        name: '画多边形',
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(polygonPoints);
          }, false),
          material: Cesium.Color.BLUE.withAlpha(0.2),
          perPositionHeight: (option && option.ground) || false // true:不贴地/false:贴地
        }
      });

      // 4. 创建一个用于显示当前绘制中的线的实体
      let drawingLine = viewer.entities.add({
        id: 'drawingLine',
        name: '画线',
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return polygonPoints;
          }, false),
          width: 3,
          material: Cesium.Color.GREEN
        }
      });

      // 5. 监听鼠标点击事件，将点击的点添加到顶点数组中，并添加点实体
      this.destroyHandler();
      // 创建一个事件处理器
      this.globalHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      let handler = this.globalHandler;
      handler.setInputAction(event => {
        var cartesian = this.getCatesian3FromPX(event.position);
        if (cartesian) {
          // 将点坐标添加到数组中
          polygonPoints.push(cartesian.clone());
          // 在第一次点击时，添加一个克隆的点到数组中，用于动态更新
          if (polygonPoints.length === 1) {
            polygonPoints.push(cartesian.clone());
          }
          // 添加点实体
          var pointEntity = viewer.entities.add({
            id: 'point' + polygonPoints.length,
            position: cartesian,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 10
            }
          });
          pointEntities.push(pointEntity);
          //添加到多边形数组中
          let cartesian3 = cartesian.clone();
          // 使用Cesium.Cartographic.fromCartesian将Cartesian3对象转换为Cartographic对象
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
          allPoints.push([Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), cartographic.height]);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 6. 监听鼠标移动事件，动态更新多边形和线的形状
      handler.setInputAction(event => {
        var cartesian = this.getCatesian3FromPX(event.endPosition);
        if (polygonPoints.length >= 2) {
          if (cartesian && cartesian.x) {
            polygonPoints.pop();
            polygonPoints.push(cartesian);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 7. 监听鼠标双击事件，结束绘制
      handler.setInputAction(() => {
        var cartesian = polygonPoints[polygonPoints.length - 1];
        handler.destroy(); // 关闭鼠标事件监听，结束绘制
        // 移除因单击事件产生的最后一个点
        if (polygonPoints.length > 1) {
          // 去除数组中最后一个点
          polygonPoints.pop();
          // 返回值
          allPoints.pop();
          allPoints.push(allPoints[0]); // 闭合
          var endPoint = viewer.entities.getById('point' + (polygonPoints.length + 1));
          if (endPoint) {
            viewer.entities.remove(endPoint);
          }
          var startPoint = viewer.entities.getById('point1');
          if (startPoint) {
            viewer.entities.remove(startPoint);
          }
        }
        resolve(allPoints);

        // 移除用于绘制的动态线实体
        viewer.entities.remove(drawingLine);

        // 以下为拖拽点改变多边形形状代码
        let selectedPointEntity = null;
        let selectedIndex = -1;
        var dragHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        //鼠标按下
        dragHandler.setInputAction(event => {
          const pickedObject = viewer.scene.pick(event.position);
          if (Cesium.defined(pickedObject) && pointEntities.includes(pickedObject.id)) {
            selectedPointEntity = pickedObject.id;
            selectedIndex = pointEntities.indexOf(selectedPointEntity);

            // 禁用摄像机控制
            viewer.scene.screenSpaceCameraController.enableRotate = false;
            viewer.scene.screenSpaceCameraController.enableTranslate = false;
            viewer.scene.screenSpaceCameraController.enableZoom = false;
            viewer.scene.screenSpaceCameraController.enableTilt = false;
            viewer.scene.screenSpaceCameraController.enableLook = false;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // 当鼠标移动时
        dragHandler.setInputAction(event => {
          if (selectedPointEntity) {
            const cartesian = this.getCatesian3FromPX(event.endPosition);
            if (cartesian && selectedIndex !== -1) {
              selectedPointEntity.position = cartesian;
              polygonPoints[selectedIndex] = cartesian;
              // 如果当前拖动的是第一个点或是最后一个点
              if (selectedIndex === 0 || selectedIndex === polygonPoints.length - 2) {
                polygonPoints[polygonPoints.length - 1] = cartesian;
                pointEntities[polygonPoints.length - 1].position.setValue(cartesian);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 当鼠标左键抬起时
        dragHandler.setInputAction(() => {
          selectedPointEntity = null;
          selectedIndex = -1;

          // 启用摄像机控制
          viewer.scene.screenSpaceCameraController.enableRotate = true;
          viewer.scene.screenSpaceCameraController.enableTranslate = true;
          viewer.scene.screenSpaceCameraController.enableZoom = true;
          viewer.scene.screenSpaceCameraController.enableTilt = true;
          viewer.scene.screenSpaceCameraController.enableLook = true;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    });
  },

  /**
   * 拾取位置点
   * （屏幕坐标转笛卡尔坐标）
   * @param {Object} px 屏幕坐标
   * @return {Object} Cartesian3 三维坐标
   */
  getCatesian3FromPX: function (px) {
    if (this.viewer && px) {
      var picks = this.viewer.scene.drillPick(px);
      var cartesian = null;
      var isOn3dtiles = false,
        isOnTerrain = false;
      // drillPick
      for (let i in picks) {
        let pick = picks[i];

        if ((pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) || (pick && pick.primitive instanceof Cesium.Cesium3DTileset) || (pick && pick.primitive instanceof Cesium.Model)) {
          //模型上拾取
          isOn3dtiles = true;
        }
        // 3dtilset
        if (isOn3dtiles) {
          this.viewer.scene.pick(px); // pick
          cartesian = this.viewer.scene.pickPosition(px);
          if (cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic.height < 0) cartographic.height = 0;
            let lon = Cesium.Math.toDegrees(cartographic.longitude),
              lat = Cesium.Math.toDegrees(cartographic.latitude),
              height = cartographic.height;
            cartesian = this.transformWGS84ToCartesian({
              lng: lon,
              lat: lat,
              alt: height
            });
          }
        }
      }
      // 地形
      let boolTerrain = this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
      // Terrain
      if (!isOn3dtiles && !boolTerrain) {
        var ray = this.viewer.scene.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        isOnTerrain = true;
      }
      // 地球
      if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
        cartesian = this.viewer.scene.camera.pickEllipsoid(px, this.viewer.scene.globe.ellipsoid);
      }
      if (cartesian) {
        let position = this.transformCartesianToWGS84(cartesian);
        if (position.alt < 0) {
          cartesian = this.transformWGS84ToCartesian(position, 0.1);
        }
        return cartesian;
      }
      return false;
    }
  },
  /***
   * 坐标转换 84转笛卡尔
   * @param {Object} {lng,lat,alt} 地理坐标
   * @return {Object} Cartesian3 三维位置坐标
   */
  transformWGS84ToCartesian: function (position, alt) {
    if (this.viewer) {
      return position ? Cesium.Cartesian3.fromDegrees(position.lng || position.lon, position.lat, (position.alt = alt || position.alt), Cesium.Ellipsoid.WGS84) : Cesium.Cartesian3.ZERO;
    }
  },
  /***
   * 坐标转换 笛卡尔转84
   * @param {Object} Cartesian3 三维位置坐标
   * @return {Object} {lng,lat,alt} 地理坐标
   */
  transformCartesianToWGS84: function (cartesian) {
    if (this.viewer && cartesian) {
      var ellipsoid = Cesium.Ellipsoid.WGS84;
      var cartographic = ellipsoid.cartesianToCartographic(cartesian);
      return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        alt: cartographic.height
      };
    }
  },
  /**
   * 空间分析-填挖方分析
   * @param allPoints 多边形顶点集合
   * @param height 填挖方平整面高度
   * @param precision 填挖方平整面精度
   */
  FillDigAnalysis(allPoints, height, precision) {
    var viewer = this.viewer;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    var positionArray = [];
    var polygons = [];
    let clippingPoints = allPoints;

    //将第一个点添加到最后一个点，完成闭环
    clippingPoints.push(clippingPoints[0]);
    // 将点集合逆转
    let newClippingPoints = clippingPoints.reverse();
    for (let i = 0; i < newClippingPoints.length; i++) {
      positionArray.push(Cesium.Cartesian3.fromDegrees(newClippingPoints[i][0], newClippingPoints[i][1], height));
      polygons.push(newClippingPoints[i][0], newClippingPoints[i][1]);
    }
    var positions = positionArray;
    var Height = height;
    var Precision = precision;
    var MaxHeigh = -1000000;
    var geom = null;
    var pointArray = [];
    viewer.entities.add({
      id: 'FillDigAnalysis',
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polygons)),

        extrudedHeight: height,
        perPositionHeight: true,
        material: new Cesium.Color.fromBytes(64, 157, 253, 150)
      }
    });
    class CutFillAnalysis {
      constructor(viewer, positions, height, precision) {
        if (!viewer) throw new Error('no viewer object!');
        if (!positions) throw new Error('no positions object!');
        if (!height) throw new Error('no height object!');
        this.createPolygonGeo(positions);
      }
      createPolygonGeo(points) {
        //计算网格粒度-精度
        let granularity = Math.PI / Math.pow(2, 11);
        granularity = granularity / Precision;
        let polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
          positions: points,
          vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
          granularity: granularity
        });
        //创建多边形平面几何体
        geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);
      }
      VolumeAnalysis() {
        let cutArea = 0,
          cutVolume = 0,
          fillArea = 0,
          fillVolume = 0,
          noArea = 0,
          allVolume = 0;
        const indices = geom.indices; //获取顶点索引数据
        const positions = geom.attributes.position.values;
        for (let index = 0; index < indices.length; index += 3) {
          const pos0 = this.returnPosition(positions, indices[index]);
          const pos1 = this.returnPosition(positions, indices[index + 1]);
          const pos2 = this.returnPosition(positions, indices[index + 2]);
          //水平状态下三角形面积
          const area = this.computeArea4Triangle(pos0.noHeightPos, pos1.noHeightPos, pos2.noHeightPos);
          //计算三个点的均高
          const height = (pos0.height + pos1.height + pos2.height) / 3;
          var color = Cesium.Color.RED;
          if (height < Height) {
            // 需要填方的部分
            fillArea += area;
            const volume = area * (Height - height);
            fillVolume += volume;
          } else if (height == Height) {
            noArea += area;
          } else {
            // 需要挖方的部分
            color = Cesium.Color.GREEN;
            cutArea += area;
            const volume = area * (height - Height);
            cutVolume += volume;
          }
          viewer.entities.add({
            name: '三角面',
            polygon: {
              hierarchy: [pos0.heightPos, pos1.heightPos, pos2.heightPos],
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              perPositionHeight: true,
              material: Cesium.Color.fromCssColorString('#23B8BA').withAlpha(0.0),
              //  extrudedHeight: 0,
              outline: true,
              outlineColor: color
            }
          });
        }
        const allArea = cutArea + fillArea + noArea;
        allVolume = allArea * Height;
        var result = {
          allArea,
          allVolume,
          cutArea,
          cutVolume,
          fillArea,
          fillVolume,
          noArea
        };
        return result;
      }
      computeCentroid4Polygon(positions) {
        let x = [],
          y = [];
        let allX = 0,
          allY = 0;
        for (let i = 0; i < positions.length; i++) {
          let cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
          allX += cartographic.longitude;
          allY += cartographic.latitude;
          x.push(cartographic.longitude);
          y.push(cartographic.latitude);
        }
        let centroidx = allX / positions.length;
        let centroidy = allY / positions.length;
        const Cartographic = new Cesium.Cartographic(centroidx, centroidy);
        return Cesium.Cartesian3.fromRadians(Cartographic.longitude, Cartographic.latitude, MaxHeigh + 30);
      }
      /**
       * 海伦公式求取三角形面积
       * @param {*} pos1
       * @param {*} pos2
       * @param {*} pos3
       * @returns 三角形面积㎡
       */
      computeArea4Triangle(pos1, pos2, pos3) {
        let a = Cesium.Cartesian3.distance(pos1, pos2);
        let b = Cesium.Cartesian3.distance(pos2, pos3);
        let c = Cesium.Cartesian3.distance(pos3, pos1);
        let S = (a + b + c) / 2;
        return Math.sqrt(S * (S - a) * (S - b) * (S - c));
      }
      returnPosition(positions, index) {
        let cartesian = new Cesium.Cartesian3(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let height = viewer.scene.globe.getHeight(cartographic);
        if (height > MaxHeigh) {
          MaxHeigh = height;
        }
        return {
          heightPos: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height),
          noHeightPos: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0),
          height: height
        };
      }
    }
    const analysisObj = new CutFillAnalysis(viewer, positions, Height, Precision);
    return analysisObj.VolumeAnalysis();
  },
  /**
   * 空间分析-热力图
   * @param {*} data    点数据
   * @param {*} region  区域
   * @param {*} heatmapParameter  热力图参数
   */
  ThermalMap(data, region, heatmapParameter) {
    var viewer = this.viewer;
    var min = 0;
    var max = 0;
    const heatpoints = [];
    const regions = region;
    for (var feature of data) {
      if (feature.longitude && feature.latitude) {
        max = Math.max(max, feature.count);
        min = Math.min(min, feature.count);
        heatpoints.push({
          x: parseFloat(feature.longitude),
          y: parseFloat(feature.latitude),
          value: feature.count
        });
      }
    }
    //addHeatMap(min, max, heatpoints, regions);
    function addHeatMap(min, max, heatPoints, regions) {
      // 创建一个矩形，包围要做热力的区域
      const features = regions;
      const points = [];
      const bpoint = [];
      for (const coord of features) {
        points.push(coord.longitude, coord.latitude);
        bpoint.push(new Cesium.Cartographic(coord.longitude, coord.latitude, 0));
      }
      // eslint-disable-next-line new-cap
      // 根据数据计算范围
      const bound = new Cesium.Rectangle.fromCartographicArray(bpoint);
      // eslint-disable-next-line no-undef
      const heatMap = CesiumHeatmap.create(viewer, bound, {
        // heatmap相应参数
        backgroundColor: heatmapParameter.backgroundColor != null ? heatmapParameter.backgroundColor : 'rgba(0,0,0,0)',
        radius: heatmapParameter.radius != null ? heatmapParameter.radius : 50,
        maxOpacity: heatmapParameter.maxOpacity != null ? heatmapParameter.maxOpacity : 0.5,
        minOpacity: heatmapParameter.minOpacity != null ? heatmapParameter.minOpacity : 0,
        blur: heatmapParameter.blur != null ? heatmapParameter.blur : 0.85
      });

      heatMap.setWGS84Data(min, max, heatPoints);
      const img = heatMap._heatmap._renderer.canvas;

      const entity = viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(points), // 多边形
          material: new Cesium.ImageMaterialProperty({
            image: img
          })
        }
      });
    }
    function returnPosition(positions, index) {
      let cartesian = new Cesium.Cartesian3(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let height = viewer.scene.globe.getHeight(cartographic);
      if (height > MaxHeigh) {
        MaxHeigh = height;
      }
      return {
        heightPos: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height),
        noHeightPos: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0),
        height: height
      };
    }

    var points = turf.randomPoint(1000, {
      bbox: [116.102442, 35.085321, 117.202442, 36.285321]
    });

    // add a random property to each point between 0 and 9
    for (var i = 0; i < points.features.length; i++) {
      points.features[i].properties.z = Math.floor(Math.random() * 100 + 100);
    }
    var tin = turf.tin(points, 'z');
    for (var i = 0; i < tin.features.length; i++) {
      var triangle = tin.features[i];
      for (var j = 0; j < triangle.geometry.coordinates[0].length; j++) {
        var coord = triangle.geometry.coordinates[0][j];
        var correspondingPoint = points.features.find(point => {
          return point.geometry.coordinates[0] === coord[0] && point.geometry.coordinates[1] === coord[1];
        });
        if (correspondingPoint) {
          // Set the height of the vertex to the 'z' property
          coord[2] = correspondingPoint.properties.z;
        }
      }
    }
    var dataSource = Cesium.GeoJsonDataSource.load(tin);
    viewer.dataSources.add(dataSource);
    console.log(dataSource);
    dataSource.then(function (ds) {
      viewer.zoomTo(ds.entities.values);
      ds.entities.values.forEach(function (entity) {
        entity.polygon.material = Cesium.Color.RED.withAlpha(0.6);
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.BLUE;
      });
    });
  },
  /**
   * 空间分析-热力图(3D)
   * @param {*} data    点数据
   * @param {*} setCameraView_3  设置相机视角
   */
  ThermalMap_3D(data, setCameraView_3) {
    var viewer = this.viewer;
    util.setCameraView(setCameraView_3, viewer);
    var heatmapInstance = new Heatmap3d(viewer, {
      list: data,
      raduis: 18,
      baseHeight: 500,
      primitiveType: 'TRNGLE',
      gradient: {
        '.3': 'blue',
        '.5': 'green',
        '.7': 'yellow',
        '.95': 'red'
      }
    });
  },
  /**
   * 空间分析-坡度坡向
   * @param {*} positions  坐标点
   */
  Slope_Aspect_Analysis() {
    var viewer = this.viewer;
    var polygons = [];
    // let clippingPoints = this.clippingPoints;
    // //将第一个点添加到最后一个点，完成闭环
    // clippingPoints.push(clippingPoints[0]);
    // // 将点集合逆转
    // let newClippingPoints = clippingPoints.reverse();
    // for (let i = 0; i < newClippingPoints.length; i++) {
    //   polygons.push([newClippingPoints[i][0], newClippingPoints[i][1],newClippingPoints[i][2]]);
    // }

    // var bbox = [117, 36.1,117.1, 36.2];
    // var cellSide = 0.1;
    // var options = {units: 'miles'};
    // var squareGrid = turf.squareGrid(bbox, cellSide, options);
    // for(let i=0;i<squareGrid.features.length;i++){
    //   let data=squareGrid.features[i].geometry.coordinates
    //   let Array=[]
    //   for(let j=0;j<data.length;j++){
    //     Array.push(Cesium.Cartesian3.fromDegrees(data[j][0],data[j][1]))
    //   }
    //   viewer.entities.add({
    //     name: "面",
    //     id:'面'+i,
    //     show: true,
    //     polygon: {
    //         hierarchy: new Cesium.PolygonHierarchy(Array),
    //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //         material: Cesium.Color.RED.withAlpha(0.65),
    //         outline: false,
    //         extrudedHeight:2000
    //     }
    //   });
    //   console.log(1)
    // }
  },
  sanjiao() {
    //     var viewer = this.viewer
    //       // 计算给定范围的 Rectangle R1
    // var west = Cesium.Math.toRadians(117.0878097757517);
    // var south = Cesium.Math.toRadians(36.19394569721049);
    // var east = Cesium.Math.toRadians( 117.09466826599007);
    // var north = Cesium.Math.toRadians(36.201577536155376);
    // var R1 = new Cesium.Rectangle(west, south, east, north);
    // // 遍历地形瓦片，获取与 R1 相交的 QuadtreeTile
    // var globe = viewer.scene.globe;
    // var tilesToRender = globe._surface._tilesToRender;
    // var intersectingTiles = [];
    // for (var i = 0; i < tilesToRender.length; i++) {
    //   var tile = tilesToRender[i];
    //   var R2 = tile.rectangle;
    //   // 判断 R1 是否与 R2 相交
    //   if (Cesium.Rectangle.intersection(R1, R2, new Cesium.Rectangle())) {
    //     intersectingTiles.push(tile);
    //   }
    // }
    // var MaxHeigh=-10000
    // function returnPosition(positions, index) {
    //   let cartesian = new Cesium.Cartesian3(
    //     positions[index * 3],
    //     positions[index * 3 + 1],
    //     positions[index * 3 + 2]
    //   );
    //   let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    //   let height = viewer.scene.globe.getHeight(cartographic);
    //   if (height > MaxHeigh) {
    //     MaxHeigh = height;
    //   }
    //   return {
    //     heightPos: Cesium.Cartesian3.fromRadians(
    //       cartographic.longitude,
    //       cartographic.latitude,
    //       height
    //     ),
    //     noHeightPos: Cesium.Cartesian3.fromRadians(
    //       cartographic.longitude,
    //       cartographic.latitude,
    //       0
    //     ),
    //     height: height
    //   };
    // }
    // // 获取范围内的所有三角面
    // var triangles = [];
    // for (var i = 0; i < intersectingTiles.length; i++) {
    //   var tile = intersectingTiles[i];
    //   var mesh = tile.data.mesh;
    //   // 获取当前瓦片的所有三角面
    //   var positions = mesh.vertices;
    //   var indices = mesh.indices;
    //   var triangles = [];
    // // 遍历索引数组，根据每个三角形的顶点索引来获取顶点坐标，将这些顶点坐标组成一个三角形，加入三角形集合中
    // for (var j = 0; j < indices.length; j += 3) {
    //   // var i1 = indices[j];
    //   // var i2 = indices[j + 1];
    //   // var i3 = indices[j + 2];
    //   // var p1 = positions[i1];
    //   // var p2 = positions[i2];
    //   // var p3 = positions[i3];
    //   // triangles.push(p1, p2, p3);
    //   const pos0 = returnPosition(positions, indices[j]);
    //   const pos1 = returnPosition(positions, indices[j + 1]);
    //   const pos2 = returnPosition(positions, indices[j + 2]);
    //   viewer.entities.add({
    //     name: "三角面",
    //     polygon: {
    //       hierarchy: [pos0.heightPos, pos1.heightPos, pos2.heightPos],
    //       perPositionHeight: true,
    //       material: Cesium.Color.fromRandom(),
    //       extrudedHeight: this.height,
    //       outline: true,
    //       outlineColor: Cesium.Color.BLACK
    //     }
    //   });
    // }
    // }
  },
  AddTiandituWmts(e) {
    let t = this.viewer,
      i = window.tiandituToken;
    var a = 'https://t{s}.tianditu.gov.cn/',
      n = ['0', '1', '2', '3', '4', '5', '6', '7'];
    for (let A = 0; A < e.length; A++) {
      switch (e[A]) {
        case '矢量底图':
          var r = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(r);
          break;
        case '矢量注记':
          var o = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(o);
          break;
        case '影像底图':
          var s = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(s);
          break;
        case '影像注记':
          var l = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(l);
          break;
        case '地形晕渲':
          var c = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(c);
          break;
        case '地形注记':
          var u = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
          });
          t.imageryLayers.addImageryProvider(u);
          break;
        case '地形':
          for (var d = new Array(), m = 0; m < n.length; m++) {
            var h = a.replace('{s}', n[m]) + 'DataServer?T=elv_c&tk=' + i;
            d.push(h);
          }
          var p = new Cesium.createWorldTerrain({
            urls: d
          });
          t.terrainProvider = p;
          break;
        case '国界':
          var g = new Cesium.UrlTemplateImageryProvider({
            url: a + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + i,
            subdomains: n,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 10
          });
          t.imageryLayers.addImageryProvider(g);
      }
    }
  },
  AddJson() {
    var e = this.viewer,
      t = this;
    Cesium.Resource.fetchJson('../static/test.json').then(function (i) {
      i.forEach((i, a) => {
        var n = i[0],
          r = i[1],
          o = n.map(function (e, t) {
            return Cesium.Cartesian3.fromDegrees(e[0], e[1], r[t] + 250 - 200);
          }),
          s = (1 / 3) * (1 - t.calculateSlopeAndAspect(o[0], o[1], o[2]).slope / 60),
          l = Cesium.Color.fromHsl(s, 1, 0.5).withAlpha(1);
        e.entities.add({
          name: '顶面',
          id: '顶面' + a,
          polygon: {
            hierarchy: [o[0], o[1], o[2]],
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            perPositionHeight: !0,
            material: Cesium.Color.WHITE.withAlpha(0),
            outline: !0,
            outlineColor: l
          }
        });
        const c = n.map(function (e) {
          return Cesium.Cartesian3.fromDegrees(e[0], e[1], 250);
        });
        for (var u = 0; u < o.length - 1; u++) {
          const t = (u + 1) % 3,
            i = [o[u], o[t], c[t], c[u]];
          e.entities.add({
            name: '侧面' + u,
            id: 'sideWall' + a + '_' + u,
            polygon: {
              hierarchy: i,
              perPositionHeight: !0,
              material: Cesium.Color.BLACK.withAlpha(0),
              outline: !0,
              outlineColor: Cesium.Color.BLACK.withAlpha(0)
            }
          });
        }
        e.entities.add({
          name: '底面',
          id: 'bottomFace' + a,
          polygon: {
            hierarchy: c,
            perPositionHeight: !0,
            material: Cesium.Color.WHITE.withAlpha(0),
            outline: !0,
            outlineColor: Cesium.Color.WHITE.withAlpha(0)
          }
        });
      });
    });
  },
  PieEcharts() {
    var e = [],
      t = this.viewer,
      i = this.cityData,
      a = this.geoCoordMap;
    !(function (t) {
      const i = [];
      for (let n = 0; n < t.length; n++) {
        const r = a[t[n].name];
        r &&
          (i.push({
            name: t[n].name,
            value: r.concat(t[n].value)
          }),
          e.push({
            type: 'pie',
            coordinateSystem: 'GLMap',
            label: {
              show: !1
            },
            labelLine: {
              show: !1
            },
            animationDuration: 0,
            radius: r.concat(t[n].value)[2] / 10,
            center: [r.concat(t[n].value)[0], r.concat(t[n].value)[1]],
            data: [
              {
                name: 'A',
                value: 30
              },
              {
                name: 'B',
                value: 40
              },
              {
                name: 'C',
                value: 50
              }
            ]
          }));
      }
    })(i);
    const n = {
      animation: !1,
      GLMap: {},
      series: e
    };
    this.cesiumUseEcharts(n, t);
  },
  ScatterEcharts() {
    var e = this.viewer,
      t = this.cityData,
      i = this.geoCoordMap;
    const a = function (e) {
        const t = [];
        for (let a = 0; a < e.length; a++) {
          const n = i[e[a].name];
          n &&
            t.push({
              name: e[a].name,
              value: n.concat(e[a].value)
            });
        }
        return t;
      },
      n = {
        animation: !1,
        GLMap: {},
        series: [
          {
            name: '城市',
            type: 'scatter',
            coordinateSystem: 'GLMap',
            data: a(t),
            symbolSize: function (e) {
              return e[2] / 10;
            },
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: !1
              },
              emphasis: {
                show: !0
              }
            },
            itemStyle: {
              normal: {
                color: '#ddb926'
              }
            }
          },
          {
            name: '前5',
            type: 'effectScatter',
            coordinateSystem: 'GLMap',
            data: a(
              t
                .sort(function (e, t) {
                  return t.value - e.value;
                })
                .slice(0, 6)
            ),
            symbolSize: function (e) {
              return e[2] / 10;
            },
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke'
            },
            hoverAnimation: !0,
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: !0
              }
            },
            itemStyle: {
              normal: {
                color: '#f4e925',
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            zlevel: 1
          }
        ]
      };
    this.cesiumUseEcharts(n, e);
  },
  FlyEcharts() {
    var e = this.viewer,
      t = this.geoCoordMap;
    const i = function (e) {
        const i = [];
        for (let a = 0; a < e.length; a++) {
          const n = e[a],
            r = t[n[0].name],
            o = t[n[1].name];
          r &&
            o &&
            i.push({
              fromName: n[0].name,
              toName: n[1].name,
              coords: [r, o],
              value: n[1].value
            });
        }
        return i;
      },
      a = ['#a6c84c', '#ffa022', '#46bee9'],
      n = [];
    [
      [
        '西安',
        [
          [
            {
              name: '西安'
            },
            {
              name: '北京',
              value: 100
            }
          ],
          [
            {
              name: '西安'
            },
            {
              name: '上海',
              value: 100
            }
          ],
          [
            {
              name: '西安'
            },
            {
              name: '广州',
              value: 100
            }
          ],
          [
            {
              name: '西安'
            },
            {
              name: '西宁',
              value: 100
            }
          ],
          [
            {
              name: '西安'
            },
            {
              name: '银川',
              value: 100
            }
          ]
        ]
      ],
      [
        '西宁',
        [
          [
            {
              name: '西宁'
            },
            {
              name: '北京',
              value: 100
            }
          ],
          [
            {
              name: '西宁'
            },
            {
              name: '上海',
              value: 100
            }
          ],
          [
            {
              name: '西宁'
            },
            {
              name: '广州',
              value: 100
            }
          ],
          [
            {
              name: '西宁'
            },
            {
              name: '西安',
              value: 100
            }
          ],
          [
            {
              name: '西宁'
            },
            {
              name: '银川',
              value: 100
            }
          ]
        ]
      ],
      [
        '银川',
        [
          [
            {
              name: '银川'
            },
            {
              name: '北京',
              value: 100
            }
          ],
          [
            {
              name: '银川'
            },
            {
              name: '广州',
              value: 100
            }
          ],
          [
            {
              name: '银川'
            },
            {
              name: '上海',
              value: 100
            }
          ],
          [
            {
              name: '银川'
            },
            {
              name: '西安',
              value: 100
            }
          ],
          [
            {
              name: '银川'
            },
            {
              name: '西宁',
              value: 100
            }
          ]
        ]
      ]
    ].forEach(function (e, r) {
      n.push(
        {
          name: e[0] + ' Top3',
          type: 'lines',
          coordinateSystem: 'GLMap',
          zlevel: 1,
          effect: {
            show: !0,
            period: 6,
            trailLength: 0.7,
            color: 'red',
            symbolSize: 3
          },
          lineStyle: {
            normal: {
              color: a[r],
              width: 0,
              curveness: 0.2
            }
          },
          data: i(e[1])
        },
        {
          name: e[0] + ' Top3',
          type: 'lines',
          coordinateSystem: 'GLMap',
          zlevel: 2,
          symbol: ['none', 'arrow'],
          symbolSize: 10,
          effect: {
            show: !0,
            period: 6,
            trailLength: 0,
            symbol:
              'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z',
            symbolSize: 15
          },
          lineStyle: {
            normal: {
              color: a[r],
              width: 1,
              opacity: 0.6,
              curveness: 0.2
            }
          },
          data: i(e[1])
        },
        {
          name: e[0] + ' Top3',
          type: 'effectScatter',
          coordinateSystem: 'GLMap',
          zlevel: 2,
          rippleEffect: {
            brushType: 'stroke'
          },
          label: {
            normal: {
              show: !0,
              position: 'right',
              formatter: '{b}'
            }
          },
          symbolSize: function (e) {
            return e[2] / 8;
          },
          itemStyle: {
            normal: {
              color: a[r]
            },
            emphasis: {
              areaColor: '#2B91B7'
            }
          },
          data: e[1].map(function (e) {
            return {
              name: e[1].name,
              value: t[e[1].name].concat([e[1].value])
            };
          })
        }
      );
    });
    const r = {
      animation: !1,
      GLMap: {},
      series: n
    };
    this.cesiumUseEcharts(r, e);
  },
  FlowEcharts() {
    var e = this.viewer;
    const t = {
        黑龙江: [127.9688, 45.368],
        内蒙古: [110.3467, 41.4899],
        吉林: [125.8154, 44.2584],
        北京市: [116.4551, 40.2539],
        辽宁: [123.1238, 42.1216],
        河北: [114.4995, 38.1006],
        天津: [117.4219, 39.4189],
        山西: [112.3352, 37.9413],
        陕西: [109.1162, 34.2004],
        甘肃: [103.5901, 36.3043],
        宁夏: [106.3586, 38.1775],
        青海: [101.4038, 36.8207],
        新疆: [87.9236, 43.5883],
        西藏: [91.11, 29.97],
        四川: [103.9526, 30.7617],
        重庆: [108.384366, 30.439702],
        山东: [117.1582, 36.8701],
        河南: [113.4668, 34.6234],
        江苏: [118.8062, 31.9208],
        安徽: [117.29, 32.0581],
        湖北: [114.3896, 30.6628],
        浙江: [119.5313, 29.8773],
        福建: [119.4543, 25.9222],
        江西: [116.0046, 28.6633],
        湖南: [113.0823, 28.2568],
        贵州: [106.6992, 26.7682],
        云南: [102.9199, 25.4663],
        广东: [113.12244, 23.009505],
        广西: [108.479, 23.1152],
        海南: [110.3893, 19.8516],
        上海: [121.4648, 31.2891]
      },
      i = [];
    [
      [
        '北京市',
        [
          [
            {
              name: '黑龙江',
              value: 0
            }
          ],
          [
            {
              name: '内蒙古',
              value: 0
            }
          ],
          [
            {
              name: '吉林',
              value: 0
            }
          ],
          [
            {
              name: '辽宁',
              value: 0
            }
          ],
          [
            {
              name: '河北',
              value: 0
            }
          ],
          [
            {
              name: '天津',
              value: 0
            }
          ],
          [
            {
              name: '山西',
              value: 0
            }
          ],
          [
            {
              name: '陕西',
              value: 0
            }
          ],
          [
            {
              name: '甘肃',
              value: 0
            }
          ],
          [
            {
              name: '宁夏',
              value: 0
            }
          ],
          [
            {
              name: '青海',
              value: 0
            }
          ],
          [
            {
              name: '新疆',
              value: 0
            }
          ],
          [
            {
              name: '西藏',
              value: 0
            }
          ],
          [
            {
              name: '四川',
              value: 0
            }
          ],
          [
            {
              name: '重庆',
              value: 0
            }
          ],
          [
            {
              name: '山东',
              value: 0
            }
          ],
          [
            {
              name: '河南',
              value: 0
            }
          ],
          [
            {
              name: '江苏',
              value: 0
            }
          ],
          [
            {
              name: '安徽',
              value: 0
            }
          ],
          [
            {
              name: '湖北',
              value: 0
            }
          ],
          [
            {
              name: '浙江',
              value: 0
            }
          ],
          [
            {
              name: '福建',
              value: 0
            }
          ],
          [
            {
              name: '江西',
              value: 0
            }
          ],
          [
            {
              name: '湖南',
              value: 0
            }
          ],
          [
            {
              name: '贵州',
              value: 0
            }
          ],
          [
            {
              name: '广西',
              value: 0
            }
          ],
          [
            {
              name: '海南',
              value: 0
            }
          ],
          [
            {
              name: '上海',
              value: 1
            }
          ]
        ]
      ]
    ].forEach(function (e, a) {
      i.push(
        {
          type: 'lines',
          coordinateSystem: 'GLMap',
          zlevel: 2,
          effect: {
            show: !0,
            period: 4,
            trailLength: 0.02,
            symbol: 'arrow',
            symbolSize: 5
          },
          lineStyle: {
            normal: {
              width: 1,
              opacity: 1,
              color: '#00EAFF',
              curveness: 0.3
            }
          },
          data: (function (e) {
            const i = [];
            for (let a = 0; a < e.length; a++) {
              const n = e[a],
                r = t[n[0].name],
                o = [116.4551, 40.2539];
              r &&
                o &&
                i.push([
                  {
                    coord: r,
                    value: n[0].value
                  },
                  {
                    coord: o
                  }
                ]);
            }
            return i;
          })(e[1])
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'GLMap',
          zlevel: 2,
          rippleEffect: {
            period: 4,
            brushType: 'stroke',
            scale: 4
          },
          label: {
            normal: {
              show: !0,
              position: 'right',
              offset: [5, 0],
              formatter: function (e) {
                return e.data.name;
              },
              fontSize: 13
            },
            emphasis: {
              show: !0
            }
          },
          symbol: 'circle',
          symbolSize: function (e) {
            return 5 + 5 * e[2];
          },
          itemStyle: {
            normal: {
              show: !1,
              color: '#32ff9d'
            }
          },
          data: e[1].map(function (e) {
            return {
              name: e[0].name,
              value: t[e[0].name].concat([e[0].value])
            };
          })
        },
        {
          type: 'scatter',
          coordinateSystem: 'GLMap',
          zlevel: 2,
          rippleEffect: {
            period: 4,
            brushType: 'stroke',
            scale: 4
          },
          itemStyle: {
            normal: {
              color: '#ff0617'
            }
          },
          label: {
            normal: {
              show: !0,
              position: 'right',
              color: '#0f0',
              formatter: '{b}',
              textStyle: {
                color: '#0f0'
              }
            },
            emphasis: {
              show: !0,
              color: '#f60'
            }
          },
          symbol: 'pin',
          symbolSize: 50,
          data: [
            {
              name: e[0],
              value: t[e[0]].concat([10])
            }
          ]
        }
      );
    });
    var a = {
      animation: !1,
      GLMap: {},
      series: i
    };
    this.cesiumUseEcharts(a, e);
  },
  BarEcharts() {
    var e = this.viewer,
      t = this.geoCoordMap;
    const i = new Cesium.BillboardCollection({
        show: !0
      }),
      a = e.scene.primitives.add(i);
    [
      {
        name: '海门',
        value: 9
      },
      {
        name: '鄂尔多斯',
        value: 12
      },
      {
        name: '招远',
        value: 12
      },
      {
        name: '舟山',
        value: 12
      },
      {
        name: '齐齐哈尔',
        value: 14
      },
      {
        name: '盐城',
        value: 15
      },
      {
        name: '赤峰',
        value: 16
      },
      {
        name: '青岛',
        value: 18
      }
    ].forEach(e => {
      ((e, t, i = () => {}) => {
        const a = document.createElement('canvas');
        (a.width = 90), (a.height = 200);
        const n = rt.init(a),
          r = {
            backgroundColor: 'transparent',
            grid: {
              top: 100,
              bottom: 150
            },
            title: {
              text: t,
              textStyle: {
                color: '#FFFFFF',
                fontWeight: 'lighter',
                fontSize: 20
              },
              left: 'center',
              bottom: 90
            },
            xAxis: {
              data: [],
              axisTick: {
                show: !1
              },
              axisLine: {
                show: !1
              }
            },
            yAxis: {
              splitLine: {
                show: !1
              },
              axisTick: {
                show: !1
              },
              axisLine: {
                show: !1
              },
              axisLabel: {
                show: !1
              }
            },
            series: [
              {
                type: 'bar',
                data: [Math.floor(1 + 10 * Math.random()), Math.floor(1 + 10 * Math.random()), Math.floor(1 + 10 * Math.random())],
                barWidth: 25,
                itemStyle: {
                  color: function (e) {
                    return ['#FF0000', '#FFFF00', '#00FF00'][e.dataIndex];
                  }
                }
              }
            ]
          };
        n.setOption(r),
          n.on('finished', function () {
            'function' == typeof i && i(a);
          });
      })(e.value, e.name, i => {
        const n = t[e.name];
        n &&
          a.add({
            position: Cesium.Cartesian3.fromDegrees(n[0], n[1], 0),
            image: i,
            size: 0.6,
            width: 60,
            height: 400
          });
      });
    });
  },
  BarEcharts2() {
    var e = this.viewer,
      t = this.geoCoordMap;
    const i = new Cesium.BillboardCollection({
        show: !0
      }),
      a = e.scene.primitives.add(i);
    [
      {
        name: '海门',
        value: 9
      },
      {
        name: '鄂尔多斯',
        value: 12
      },
      {
        name: '招远',
        value: 12
      },
      {
        name: '舟山',
        value: 12
      },
      {
        name: '齐齐哈尔',
        value: 14
      },
      {
        name: '盐城',
        value: 15
      },
      {
        name: '赤峰',
        value: 16
      },
      {
        name: '青岛',
        value: 18
      }
    ].forEach(e => {
      ((e, t = () => {}) => {
        e *= 5;
        const i = document.createElement('canvas');
        (i.width = 400), (i.height = 400);
        const a = rt.init(i),
          n = {
            backgroundColor: 'transparent',
            grid: {
              top: 200,
              bottom: 300
            },
            xAxis: {
              data: [],
              axisTick: {
                show: !1
              },
              axisLine: {
                show: !1
              }
            },
            yAxis: {
              splitLine: {
                show: !1
              },
              axisTick: {
                show: !1
              },
              axisLine: {
                show: !1
              },
              axisLabel: {
                show: !1
              }
            },
            series: [
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [100, 45],
                symbolOffset: [-10, -20],
                z: 12,
                data: [
                  {
                    name: '',
                    value: e,
                    symbolPosition: 'end',
                    itemStyle: {
                      normal: {
                        color: 'rgba(2, 163, 243,0.5)'
                      }
                    }
                  }
                ]
              },
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [100, 45],
                symbolOffset: [-10, 24],
                z: 12,
                data: [
                  {
                    name: '',
                    value: e,
                    itemStyle: {
                      normal: {
                        color: 'rgba(2, 163, 243, 1)'
                      }
                    }
                  }
                ]
              },
              {
                type: 'bar',
                barWidth: 100,
                data: [
                  {
                    name: '',
                    value: e,
                    label: {
                      normal: {
                        show: !0,
                        formatter: '{c}人',
                        position: 'top',
                        textStyle: {
                          color: 'rgba(2, 163, 243, 1)',
                          fontSize: 40,
                          fontWeight: 600
                        }
                      }
                    },
                    itemStyle: {
                      normal: {
                        color: {
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 1,
                          type: 'linear',
                          global: !1,
                          colorStops: [
                            {
                              offset: 0,
                              color: 'rgba(18, 246, 255, 0)'
                            },
                            {
                              offset: 1,
                              color: 'rgba(2, 163, 243, 1)'
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              },
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [340, 45],
                symbolOffset: [-10, -20],
                z: 12,
                data: [
                  {
                    name: '',
                    value: '100',
                    symbolPosition: 'end',
                    itemStyle: {
                      normal: {
                        color: 'rgba(0, 255, 136, 0)'
                      }
                    }
                  }
                ]
              },
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [150, 75],
                symbolOffset: [-10, 41],
                z: 12,
                data: [
                  {
                    name: '',
                    value: '100',
                    itemStyle: {
                      normal: {
                        color: 'rgba(2, 163, 243, .1)'
                      }
                    }
                  }
                ]
              },
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [150, 75],
                symbolOffset: [-10, 55],
                z: 11,
                data: [
                  {
                    name: '',
                    value: '100',
                    itemStyle: {
                      normal: {
                        color: 'transparent',
                        borderColor: 'rgba(2, 163, 243, 1)',
                        borderWidth: 30
                      }
                    }
                  }
                ]
              },
              {
                name: '',
                type: 'pictorialBar',
                symbolSize: [200, 100],
                symbolOffset: [-10, 62],
                z: 10,
                data: [
                  {
                    name: '关井数',
                    value: '100',
                    itemStyle: {
                      normal: {
                        color: 'transparent',
                        borderColor: 'rgba(2, 163, 243, 1)',
                        borderType: 'dashed',
                        borderWidth: 2
                      }
                    }
                  }
                ]
              },
              {
                type: 'bar',
                silent: !0,
                barWidth: 140,
                barGap: '-120%',
                data: [
                  {
                    name: '',
                    value: '100',
                    label: {
                      normal: {
                        show: !1
                      }
                    },
                    itemStyle: {
                      normal: {
                        color: {
                          x: 1,
                          y: 1,
                          x2: 1,
                          y2: 0,
                          type: 'linear',
                          global: !1,
                          colorStops: [
                            {
                              offset: 0,
                              color: 'rgba(0, 255, 136, 0)'
                            },
                            {
                              offset: 0.3,
                              color: 'rgba(0, 255, 136, .1)'
                            },
                            {
                              offset: 0.5,
                              color: 'rgba(0, 255, 136, .1)'
                            },
                            {
                              offset: 0.8,
                              color: 'rgba(0, 255, 136, .1)'
                            },
                            {
                              offset: 1,
                              color: 'rgba(0, 255, 136, 0)'
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          };
        a.setOption(n),
          a.on('finished', function () {
            'function' == typeof t && t(i);
          });
      })(e.value, i => {
        const n = t[e.name];
        n &&
          a.add({
            position: Cesium.Cartesian3.fromDegrees(n[0], n[1], 0),
            image: i,
            size: 0.6,
            width: 150,
            height: 150
          });
      });
    });
  },
  cesiumUseEcharts(e, t) {
    function i(e, t) {
      (this._mapContainer = e), (this._overlay = this._createChartOverlay()), this._overlay.setOption(t);
    }
    !(function (e) {
      const t = {};
      function i(a) {
        if (t[a]) return t[a].exports;
        const n = (t[a] = {
          i: a,
          l: !1,
          exports: {}
        });
        return e[a].call(n.exports, n, n.exports, i), (n.l = !0), n.exports;
      }
      (i.m = e),
        (i.c = t),
        (i.d = function (e, t, a) {
          i.o(e, t) ||
            Object.defineProperty(e, t, {
              enumerable: !0,
              get: a
            });
        }),
        (i.r = function (e) {
          'undefined' != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, {
              value: 'Module'
            }),
            Object.defineProperty(e, '__esModule', {
              value: !0
            });
        }),
        (i.t = function (e, t) {
          if ((1 & t && (e = i(e)), 8 & t)) return e;
          if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
          const a = Object.create(null);
          if (
            (i.r(a),
            Object.defineProperty(a, 'default', {
              enumerable: !0,
              value: e
            }),
            2 & t && 'string' != typeof e)
          )
            for (let t in e)
              i.d(
                a,
                t,
                function (t) {
                  return e[t];
                }.bind(null, t)
              );
          return a;
        }),
        (i.n = function (e) {
          let t =
            e && e.__esModule
              ? function () {
                  return e.default;
                }
              : function () {
                  return e;
                };
          return i.d(t, 'a', t), t;
        }),
        (i.o = function (e, t) {
          return Object.prototype.hasOwnProperty.call(e, t);
        }),
        (i.p = ''),
        i((i.s = 0));
    })([
      function (e, t, i) {
        e.exports = i(1);
      },
      function (e, t, i) {
        rt ? i(2).load() : console.error('missing echarts lib');
      },
      function (e, i, a) {
        function n(e, t) {
          for (let i = 0; i < t.length; i++) {
            let a = t[i];
            (a.enumerable = a.enumerable || !1), (a.configurable = !0), 'value' in a && (a.writable = !0), Object.defineProperty(e, a.key, a);
          }
        }
        a.r(i);
        let r = (function () {
          function e(t, i) {
            !(function (e, t) {
              if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
            })(this, e),
              (this._viewer = t),
              (this.dimensions = ['lng', 'lat']),
              (this._mapOffset = [0, 0]),
              (this._api = i);
          }
          let i, a, r;
          return (
            (i = e),
            (r = [
              {
                key: 'create',
                value: function (i, a) {
                  let n;
                  i.eachComponent('GLMap', function (i) {
                    (n = new e(t, a)).setMapOffset(i.__mapOffset || [0, 0]), (i.coordinateSystem = n);
                  }),
                    i.eachSeries(function (e) {
                      'GLMap' === e.get('coordinateSystem') && (e.coordinateSystem = n);
                    });
                }
              },
              {
                key: 'dimensions',
                get: function () {
                  return ['lng', 'lat'];
                }
              }
            ]),
            (a = [
              {
                key: 'setMapOffset',
                value: function (e) {
                  return (this._mapOffset = e), this;
                }
              },
              {
                key: 'getViewer',
                value: function () {
                  return this._viewer;
                }
              },
              {
                key: 'dataToPoint',
                value: function (e) {
                  let t = this._viewer.scene,
                    i = [0, 0],
                    a = Cesium.Cartesian3.fromDegrees(e[0], e[1]);
                  if (!a) return i;
                  if (t.mode === Cesium.SceneMode.SCENE3D && Cesium.Cartesian3.angleBetween(t.camera.position, a) > Cesium.Math.toRadians(80)) return !1;
                  let n = t.cartesianToCanvasCoordinates(a);
                  return n ? [n.x - this._mapOffset[0], n.y - this._mapOffset[1]] : i;
                }
              },
              {
                key: 'pointToData',
                value: function (e) {
                  let i = this._mapOffset,
                    a = t.scene.globe.ellipsoid,
                    n = new Cesium.cartesian3(e[1] + i, e[2] + i[2], 0),
                    r = a.cartesianToCartographic(n);
                  return [r.lng, r.lat];
                }
              },
              {
                key: 'getViewRect',
                value: function () {
                  let e = this._api;
                  return new rt.graphic.BoundingRect(0, 0, e.getWidth(), e.getHeight());
                }
              },
              {
                key: 'getRoamTransform',
                value: function () {
                  return rt.matrix.create();
                }
              }
            ]) && n(i.prototype, a),
            r && n(i, r),
            e
          );
        })();
        function o() {
          rt.registerCoordinateSystem('GLMap', r),
            rt.registerAction(
              {
                type: 'GLMapRoam',
                event: 'GLMapRoam',
                update: 'updateLayout'
              },
              function (e, t) {}
            );
        }
        rt.extendComponentModel({
          type: 'GLMap',
          getViewer: function () {
            return t;
          },
          defaultOption: {
            roam: !1
          }
        }),
          rt.extendComponentView({
            type: 'GLMap',
            init: function (e, i) {
              (this.api = i), t.scene.postRender.addEventListener(this.moveHandler, this);
            },
            moveHandler: function (e, t) {
              this.api.dispatchAction({
                type: 'GLMapRoam'
              });
            },
            render: function (e, t, i) {},
            dispose: function (e) {
              t.scene.postRender.removeEventListener(this.moveHandler, this);
            }
          }),
          a.d(i, 'load', function () {
            return o;
          });
      }
    ]),
      (t = t),
      (i.prototype._createChartOverlay = function () {
        const e = this._mapContainer.scene;
        e.canvas.setAttribute('tabIndex', 0);
        const t = document.createElement('div');
        (t.style.position = 'absolute'), (t.style.top = '0px'), (t.style.left = '0px'), (t.style.width = e.canvas.width + 'px'), (t.style.height = e.canvas.height + 'px'), (t.style.pointerEvents = 'none');
        const i = document.getElementsByClassName('echartMap').length;
        return t.setAttribute('id', 'ysCesium-echarts-' + parseInt(99999 * Math.random()) + '-' + i), t.setAttribute('class', 'echartMap'), this._mapContainer.container.appendChild(t), (this._echartsContainer = t), rt.init(t);
      }),
      (i.prototype.dispose = function () {
        this._echartsContainer && (this._mapContainer.container.removeChild(this._echartsContainer), (this._echartsContainer = null)), this._overlay && (this._overlay.dispose(), (this._overlay = null));
      }),
      (i.prototype.updateOverlay = function (e) {
        this._overlay && this._overlay.setOption(e);
      }),
      (i.prototype.getMap = function () {
        return this._mapContainer;
      }),
      (i.prototype.getOverlay = function () {
        return this._overlay;
      }),
      (i.prototype.show = function () {
        document.getElementById(this._id).style.visibility = 'visible';
      }),
      (i.prototype.hide = function () {
        document.getElementById(this._id).style.visibility = 'hidden';
      }),
      new i(t, e);
  },
  //基础知识
  BasicKnowledge() {
    //1，坐标系
    //1.1，屏幕坐标系
    //   屏幕坐标系即二维笛卡尔坐标系，Cesium中使用Cartesian2来描述，原点在屏幕左上角，x轴向右，y轴向下，单位为像素。
    //1.2，笛卡尔空间直角坐标系
    //   笛卡尔空间直角坐标系即三维笛卡尔坐标系，Cesium中使用Cartesian3来描述，原点在地球中心，x轴向东，y轴向北，z轴向上，单位为米。
    //1.3，WGS84地理坐标系
    //   WGS84地理坐标系即经纬度坐标系，在表示经纬度时有度数制和弧度制两种，Cesium中使用Cartographic来描述弧度制的WGS84坐标系，原点在地球中心，x轴向东，y轴向北，z轴向上。
    //1.4，WebGL坐标系
    //  WebGL坐标系即WebGL空间直角坐标系，Cesium中使用Cartesian4来描述，原点在地球中心，x轴向东，y轴向北，z轴向上，w轴向外，单位为米。
    //2，坐标转换
    //2.1，角度与弧度互转
    //   角度转弧度：let radians=Cesium.Math.toRadians(degrees)
    //   弧度转角度：let degrees=Cesium.Math.toDegrees(radians)
    //2.2，WGS84（经纬度）与笛卡尔坐标（Cartesian3）互转
    //   WGS84转Cartesian3：
    //   (1)  直接通过经纬度转换
    //   (1).1 let cartesian3=Cesium.Cartesian3.fromDegrees(longitude,latitude,height); 格式：[113.21, 25.61, 100.0]，高度默认为0，可以不写
    //   (1).2 let cartesian3s = Cesium.Cartesian3.fromDegreesArray(coordinates); 格式：[113.21, 25.61, 113.54, 25.24]，不带高度格式的数组
    //   (1).3 let cartesian3s = Cesium.Cartesian3.fromDegreesArrayHeights(coordinates); 格式：[113.21, 25.61, 100.0, 113.54, 25.24, 200.0]，带高度格式的数组
    //   弧度制也类似，使用Cesium.Cartesian3.fromRadians, Cesium.Cartesian3.fromRadiansArray, Cesium.Cartesian3.fromRadiansArrayHeights
    //   (2)  使用椭球体转换
    //   let position=Cesium.Cartographic.fromDegrees(longitude,latitude,height);
    //   (2).1 let cartesian3=Cesium.Ellipsoid.WGS84.cartographicToCartesian(position); 单个坐标
    //   (2).2 let cartesian3s=Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(positions); 坐标数组
    //   Cartesian3转WGS84
    //   (1)  直接转换
    //   let cartographic=Cesium.Cartographic.fromCartesian(cartesian3);  直接转换得到的是WGS84弧度制的经纬度坐标，可将其再转换为角度制
    //   (2)  使用椭球体转换
    //   (2).1 let cartographic=Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3);  单个坐标
    //   (2).2 let cartographics=Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(cartesian3s);  坐标数组
    //   2.3 屏幕坐标与笛卡尔坐标互转
    //   屏幕坐标转笛卡尔坐标（Cartesian2转Cartesian3）
    //   (1) 屏幕坐标转椭球面笛卡尔坐标，不包含地形、模型等的坐标
    //   let cartesian3=viewer.scene.camera.pickEllipsoid(cartesian2);
    //   (2) 屏幕坐标转场景坐标，包含地形和模型等的场景坐标
    //   let cartesian3=viewer.scene.pickPosition(cartesian2);
    //   (3) 屏幕坐标转地表笛卡尔空间坐标，通过相机与屏幕点位连线来求取坐标
    //   let ray=viewer.camera.getPickRay(cartesian2);
    //   let cartesian3=globe.pick(ray,viewer.scene);
    //   笛卡尔坐标转屏幕坐标（Cartesian3转Cartesian2）
    //   let cartesian2=Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene,cartesian3);
    //3，基本控件
    //   见实例化地球部分
  }
};
