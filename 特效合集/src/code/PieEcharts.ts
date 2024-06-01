const Cesium = window.Cesium;
const PieEcharts = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.19777, 39.03883, 100000.0)
  });

  let canvasDom = document.createElement('canvas');
  canvasDom.width = 400;
  canvasDom.height = 400;
  let myChart = echarts.init(canvasDom);
  myChart.setOption({
    series: [
      {
        name: '姓名',
        type: 'pie',
        radius: '100%',
        center: ['50%', '50%'],
        data: [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
          { value: 484, name: 'Union Ads' },
          { value: 300, name: 'Video Ads' }
        ],
        label: {
          //展示文本设置
          normal: {
            show: false
          }
        }
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
export default PieEcharts;
