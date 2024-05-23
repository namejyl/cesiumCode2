const Cesium = window.Cesium;
const AddCesiumglb = () => {
  /**
   * 添加glb模型（键盘控制移动）
   * @param {Number} x 经度
   * @param {Number} y 纬度
   * @param {Number} z 高度
   */
  window.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
  //   this.$cesiumEarth.AddCesiumglb(117.102442, 36.185321, 4000);
  var viewer = window.viewer;

  // Load a GLB model
  const modelUrl = '/static/boat.glb';

  const position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 100);
  const heading = Cesium.Math.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));

  const model = viewer.entities.add({
    name: 'GLB Model',
    position: position,
    orientation: orientation,
    model: {
      uri: modelUrl,
      minimumPixelSize: 128,
      maximumScale: 20000
    }
  });

  // Keyboard control for model orientation
  let modelHeading = heading;
  let modelPitch = pitch;
  let modelRoll = roll;

  document.addEventListener('keydown', function (event) {
    switch (event.key) {
      case 'ArrowUp': // Increase pitch
        modelPitch += Cesium.Math.toRadians(1);
        break;
      case 'ArrowDown': // Decrease pitch
        modelPitch -= Cesium.Math.toRadians(1);
        break;
      case 'ArrowLeft': // Increase heading
        modelHeading += Cesium.Math.toRadians(1);
        break;
      case 'ArrowRight': // Decrease heading
        modelHeading -= Cesium.Math.toRadians(1);
        break;
      case 'q': // Increase roll
        modelRoll += Cesium.Math.toRadians(1);
        break;
      case 'e': // Decrease roll
        modelRoll -= Cesium.Math.toRadians(1);
        break;
    }

    const newOrientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(modelHeading, modelPitch, modelRoll));
    model.orientation = newOrientation;
  });

  viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 200),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-20),
      roll: 0
    }
  });
};
export default AddCesiumglb;
