const Cesium = window.Cesium;
export default () => {
  document.getElementsByClassName('cesium-viewer-bottom')[0].style.display = 'none';
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.31366962163708, 31.582212285238125, 12222.804219526453),
    orientation: {
      heading: Cesium.Math.toRadians(354.6893925320491 || 0),
      pitch: Cesium.Math.toRadians(-16.957477434957926 || 0),
      roll: Cesium.Math.toRadians(0.13837382238243223 || 0)
    },
    duration: 5
  });

  let list = [];
  for (let i = 0; i < 100; i++) {
    list.push({
      lnglat: [117.28 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1), 31.923 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1)],
      value: 1000 * Math.random()
    });
  }
  new window.Heatmap3d(viewer, {
    list: list,
    raduis: 15,
    baseHeight: 800,
    primitiveType: 'TRNGLE',
    gradient: {
      '.3': 'blue',
      '.5': 'green',
      '.7': 'yellow',
      '.95': 'red'
    }
  });
};
