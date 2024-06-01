const Cesium = window.Cesium;
const BarEcharts = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.19777, 39.03883, 100000.0)
  });

  let canvasDom = document.createElement('canvas');
  canvasDom.width = 400;
  canvasDom.height = 400;
  let myChart = echarts.init(canvasDom);
  myChart.setOption({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
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
export default BarEcharts;
