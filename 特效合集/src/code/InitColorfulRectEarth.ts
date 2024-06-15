const Cesium = window.Cesium;
export default () => {
  let viewer = window.Viewer;
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
  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: instances,
      appearance: new Cesium.PerInstanceColorAppearance()
    })
  );
};
