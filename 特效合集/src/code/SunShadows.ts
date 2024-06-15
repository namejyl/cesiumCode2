const Cesium = window.Cesium;
export default () => {
  var viewer = window.Viewer;
  // 加载模型
  const position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);
  const heading = Cesium.Math.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
  const entity = viewer.entities.add({
    name: '/public/glb/Cesium_Air.glb',
    position: position,
    orientation: orientation,
    model: {
      uri: '/public/glb/Cesium_Air.glb',
      minimumPixelSize: 128,
      maximumScale: 20000
    }
  });
  viewer.trackedEntity = entity;
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(-123.0744619, 44.0503706, 4137888),
    orientation: {
      heading: 0.6,
      pitch: -0.66
    }
  });
  // 开启
  viewer.scene.globe.enableLighting = true;
  viewer.clock.shouldAnimate = true;
  viewer.shadows = true;
  viewer.clock.multiplier = 1500;
};
