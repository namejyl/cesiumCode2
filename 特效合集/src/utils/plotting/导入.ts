// 导入 JSON 数据并添加实体到 Cesium Viewer
function importEntitiesFromJson(jsonData) {
  jsonData.forEach(data => {
    const entity = viewer.entities.add({
      name: data.name
    });

    if (data.position) {
      entity.position = new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(data.position.cartesian.longitude, data.position.cartesian.latitude, data.position.cartesian.height));
    }

    if (data.point) {
      entity.point = new Cesium.PointGraphics({
        color: Cesium.Color.fromCssColorString(data.point.color),
        pixelSize: data.point.pixelSize
      });
    }

    if (data.polyline) {
      entity.polyline = new Cesium.PolylineGraphics({
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(data.polyline.positions),
        width: data.polyline.width,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.polyline.material))
      });
    }

    if (data.polygon) {
      entity.polygon = new Cesium.PolygonGraphics({
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(data.polygon.hierarchy)),
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.polygon.material))
      });
    }

    if (data.ellipse) {
      entity.ellipse = new Cesium.EllipseGraphics({
        semiMinorAxis: data.ellipse.semiMinorAxis,
        semiMajorAxis: data.ellipse.semiMajorAxis,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.ellipse.material))
      });
    }

    if (data.corridor) {
      entity.corridor = new Cesium.CorridorGraphics({
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(data.corridor.positions),
        width: data.corridor.width,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.corridor.material))
      });
    }

    if (data.ellipsoid) {
      entity.ellipsoid = new Cesium.EllipsoidGraphics({
        radii: new Cesium.Cartesian3(data.ellipsoid.radii.x, data.ellipsoid.radii.y, data.ellipsoid.radii.z),
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.ellipsoid.material))
      });
    }

    if (data.rectangle) {
      entity.rectangle = new Cesium.RectangleGraphics({
        coordinates: Cesium.Rectangle.fromDegrees(data.rectangle.coordinates.west, data.rectangle.coordinates.south, data.rectangle.coordinates.east, data.rectangle.coordinates.north),
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.rectangle.material))
      });
    }

    if (data.path) {
      entity.path = new Cesium.PathGraphics({
        leadTime: data.path.leadTime,
        trailTime: data.path.trailTime,
        width: data.path.width,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.path.material))
      });
    }

    if (data.tileset) {
      entity.tileset = new Cesium.TilesetGraphics({
        uri: data.tileset.uri
      });
    }

    if (data.model) {
      entity.model = new Cesium.ModelGraphics({
        uri: data.model.uri,
        minimumPixelSize: data.model.minimumPixelSize,
        maximumScale: data.model.maximumScale
      });
    }

    if (data.label) {
      entity.label = new Cesium.LabelGraphics({
        text: data.label.text,
        font: data.label.font,
        fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString(data.label.fillColor))
      });
    }

    if (data.plane) {
      entity.plane = new Cesium.PlaneGraphics({
        plane: new Cesium.ConstantProperty(new Cesium.Plane(new Cesium.Cartesian3(data.plane.plane.normal.x, data.plane.plane.normal.y, data.plane.plane.normal.z), data.plane.plane.distance)),
        dimensions: new Cesium.ConstantProperty(new Cesium.Cartesian2(data.plane.dimensions.x, data.plane.dimensions.y)),
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.plane.material))
      });
    }

    if (data.wall) {
      entity.wall = new Cesium.WallGraphics({
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(data.wall.positions),
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(data.wall.material))
      });
    }
  });
}

const jsonData = [
  {
    name: 'Sample Point',
    position: {
      cartesian: {
        longitude: -75.59777,
        latitude: 40.03883,
        height: 0
      }
    },
    point: {
      pixelSize: 10,
      color: 'rgba(255, 0, 0, 1)'
    }
  },
  {
    name: 'Sample Polyline',
    polyline: {
      positions: [-75.1, 39.57, 0, -77.02, 38.53, 0],
      width: 5,
      material: 'rgba(0, 0, 255, 1)'
    }
  },
  {
    name: 'Sample Polygon',
    polygon: {
      hierarchy: [-115.0, 37.0, 0, -115.0, 32.0, 0, -107.0, 33.0, 0, -102.0, 31.0, 0, -102.0, 35.0, 0],
      material: 'rgba(0, 255, 0, 0.5)'
    }
  },
  {
    name: 'Sample Ellipse',
    ellipse: {
      semiMinorAxis: 300000.0,
      semiMajorAxis: 500000.0,
      material: 'rgba(255, 255, 0, 0.5)'
    }
  },
  {
    name: 'Sample Corridor',
    corridor: {
      positions: [-90.0, 40.0, 0, -85.0, 35.0, 0],
      width: 200000.0,
      material: 'rgba(255, 0, 0, 0.5)'
    }
  },
  {
    name: 'Sample Ellipsoid',
    ellipsoid: {
      radii: { x: 500000.0, y: 500000.0, z: 500000.0 },
      material: 'rgba(0, 0, 255, 0.5)'
    }
  },
  {
    name: 'Sample Rectangle',
    rectangle: {
      coordinates: { west: -80.0, south: 30.0, east: -70.0, north: 40.0 },
      material: 'rgba(0, 255, 0, 0.5)'
    }
  },
  {
    name: 'Sample Path',
    path: {
      leadTime: 2,
      trailTime: 2,
      width: 10,
      material: 'rgba(255, 255, 0, 0.5)'
    }
  },
  {
    name: 'Sample 3D Tile',
    tileset: {
      uri: 'https://cesiumjs.org/tilesets/NewYork/tileset.json'
    }
  },
  {
    name: 'Sample Model',
    model: {
      uri: '../../SampleData/models/CesiumMan/Cesium_Man.glb',
      minimumPixelSize: 128,
      maximumScale: 20000
    }
  },
  {
    name: 'Sample Label',
    label: {
      text: 'Sample Label',
      font: '24px Helvetica',
      fillColor: 'rgba(255, 255, 0, 1)'
    }
  },
  {
    name: 'Sample Plane',
    plane: {
      plane: {
        normal: { x: 0, y: 0, z: 1 },
        distance: 0
      },
      dimensions: { x: 100000.0, y: 200000.0 },
      material: 'rgba(0, 0, 255, 0.5)'
    }
  },
  {
    name: 'Sample Wall',
    wall: {
      positions: [-115.0, 37.0, 100000.0, -115.0, 32.0, 100000.0, -107.0, 33.0, 100000.0, -102.0, 31.0, 100000.0, -102.0, 35.0, 100000.0],
      material: 'rgba(255, 0, 0, 0.5)'
    }
  }
  // 添加其他实体数据...
];
