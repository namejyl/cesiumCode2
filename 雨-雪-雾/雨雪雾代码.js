if (data.label == '雨') {
  if (node) {
    if (!Effects.rainObj) {
      Effects.rainObj = new Rain(proxy.$global().Cesium, proxy.$global().viewer, {
        tiltAngle: -0.2,
        rainSize: 0.6,
        rainSpeed: 350.0
      });
    }
    Effects.rainObj.show(true);
  } else {
    if (Effects.rainObj) {
      Effects.rainObj.show(false);
    }
  }
}
if (data.label == '雪') {
  if (node) {
    if (!Effects.snowObj) {
      Effects.snowObj = new Snow(proxy.$global().Cesium, proxy.$global().viewer, {
        snowSize: 0.02, //雪大小
        snowSpeed: 60.0 //雪速
      });
    }
    Effects.snowObj.show(true);
  } else {
    if (Effects.snowObj) {
      Effects.snowObj.show(false);
    }
  }
}
if (data.label == '雾') {
  if (node) {
    if (!Effects.fogObj) {
      Effects.fogObj = new Fog(proxy.$global().Cesium, proxy.$global().viewer, {
        visibility: 0.2,
        color: proxy.$global().Cesium.Color(0.8, 0.8, 0.8, 0.3)
      });
    }
    Effects.fogObj.show(true);
  } else {
    if (Effects.fogObj) {
      Effects.fogObj.show(false);
    }
  }
}
