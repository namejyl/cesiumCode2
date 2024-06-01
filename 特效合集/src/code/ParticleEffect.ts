const Cesium = window.Cesium;
import fire1Img from '/static/fire1.png';
import waterImg from '/static/water.png';
import explosionImg from '/static/explosion.png';
const ParticleEffect = () => {
  /**
   * 粒子效果
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {String} type 粒子类型
   */
  let x = 117.102442;
  let y = 36.185321;
  let type = '水枪';
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
  var viewer = window.viewer;
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
  viewer.zoomTo(entity);
  viewer.clock.shouldAnimate = true;
  viewer.scene.globe.depthTestAgainstTerrain = false;
  viewer.trackedEntity = entity;
  particleSystem = scene.primitives.add(
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
      return removeEvent();
    }; //清除事件
    viewer.scene.primitives.remove(particleSystem); //删除粒子对象
    viewer.entities.remove(entity); //删除entity
  }
};
export default ParticleEffect;
