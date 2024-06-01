const Cesium = window.Cesium;
const ScatterEcharts = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.19777, 39.03883, 100000.0)
  });

  let canvasDom = document.createElement('canvas');
  canvasDom.width = 400;
  canvasDom.height = 400;
  let myChart = echarts.init(canvasDom);
  myChart.setOption({
    xAxis: {},
    yAxis: {},
    series: [
      {
        symbolSize: 20,
        data: [
          [10.0, 8.04],
          [8.07, 6.95],
          [13.0, 7.58],
          [9.05, 8.81],
          [11.0, 8.33],
          [14.0, 7.66],
          [13.4, 6.81],
          [10.0, 6.33],
          [14.0, 8.96],
          [12.5, 6.82],
          [9.15, 7.2],
          [11.5, 7.2],
          [3.03, 4.23],
          [12.2, 7.83],
          [2.02, 4.47],
          [1.05, 3.33],
          [4.05, 4.96],
          [6.03, 7.24],
          [12.0, 6.26],
          [12.0, 8.84],
          [7.08, 5.82],
          [5.02, 5.68]
        ],
        type: 'scatter'
      }
    ]
  });
  myChart.on('finished', () => {
    let criclePrimitive = getCriclePrimitive(myChart, 100000.0, 116.19777, 39.03883);
    viewer.scene.primitives.add(criclePrimitive);
    myChart.dispose();
    myChart = null;
    canvasDom = null;
  });
  function getCriclePrimitive(chart, radius, lon, lat) {
    let circle = new Cesium.CircleGeometry({
      center: Cesium.Cartesian3.fromDegrees(lon, lat),
      radius: radius
    });
    let circleGeometry = Cesium.CircleGeometry.createGeometry(circle);
    let circleGeometryInstance = new Cesium.GeometryInstance({
      geometry: circleGeometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE)
      }
    });
    let criclePrimitive = new Cesium.Primitive({
      geometryInstances: [circleGeometryInstance],
      appearance: new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Image',
            uniforms: {
              image: chart.getDataURL()
            }
          }
        })
      })
    });
    return criclePrimitive;
  }
};
export default ScatterEcharts;
