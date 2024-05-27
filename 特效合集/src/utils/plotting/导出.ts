const viewer = new Cesium.Viewer('cesiumContainer');

// 创建各种类型的实体
viewer.entities.add({
  name: 'Sample Point',
  position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED
  }
});

viewer.entities.add({
  name: 'Sample Polyline',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([-75.1, 39.57, -77.02, 38.53]),
    width: 5,
    material: Cesium.Color.BLUE
  }
});

viewer.entities.add({
  name: 'Sample Polygon',
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0, 35.0]),
    material: Cesium.Color.GREEN.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Ellipse',
  position: Cesium.Cartesian3.fromDegrees(-100.0, 40.0),
  ellipse: {
    semiMinorAxis: 300000.0,
    semiMajorAxis: 500000.0,
    material: Cesium.Color.YELLOW.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Corridor',
  corridor: {
    positions: Cesium.Cartesian3.fromDegreesArray([-90.0, 40.0, -85.0, 35.0]),
    width: 200000.0,
    material: Cesium.Color.RED.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Ellipsoid',
  position: Cesium.Cartesian3.fromDegrees(-100.0, 20.0),
  ellipsoid: {
    radii: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0),
    material: Cesium.Color.BLUE.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Rectangle',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(-80.0, 30.0, -70.0, 40.0),
    material: Cesium.Color.GREEN.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Path',
  position: Cesium.Cartesian3.fromDegrees(-100.0, 35.0),
  path: {
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      color: Cesium.Color.YELLOW
    }),
    width: 10
  }
});

viewer.entities.add({
  name: 'Sample 3D Tile',
  position: Cesium.Cartesian3.fromDegrees(-75.0, 40.0),
  tileset: {
    uri: 'https://cesiumjs.org/tilesets/NewYork/tileset.json'
  }
});

viewer.entities.add({
  name: 'Sample Model',
  position: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706),
  model: {
    uri: '../../SampleData/models/CesiumMan/Cesium_Man.glb',
    minimumPixelSize: 128,
    maximumScale: 20000
  }
});

viewer.entities.add({
  name: 'Sample Label',
  position: Cesium.Cartesian3.fromDegrees(-75.1641667, 39.9522222),
  label: {
    text: 'Philadelphia',
    font: '24px Helvetica',
    fillColor: Cesium.Color.YELLOW
  }
});

viewer.entities.add({
  name: 'Sample Plane',
  position: Cesium.Cartesian3.fromDegrees(-80.0, 25.0),
  plane: {
    plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
    dimensions: new Cesium.Cartesian2(100000.0, 200000.0),
    material: Cesium.Color.BLUE.withAlpha(0.5)
  }
});

viewer.entities.add({
  name: 'Sample Wall',
  wall: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([-115.0, 37.0, 100000.0, -115.0, 32.0, 100000.0, -107.0, 33.0, 100000.0, -102.0, 31.0, 100000.0, -102.0, 35.0, 100000.0]),
    material: Cesium.Color.RED.withAlpha(0.5)
  }
});

// 将实体转换为 JSON
function entitiesToJson(entities) {
  return entities.values.map(entity => {
    const jsonEntity = {
      id: entity.id,
      name: entity.name
    };

    if (entity.position) {
      jsonEntity.position = {
        cartesian: entity.position.getValue(Cesium.JulianDate.now())
      };
    }

    if (entity.point) {
      jsonEntity.point = {
        pixelSize: entity.point.pixelSize.getValue(Cesium.JulianDate.now()),
        color: entity.point.color.getValue(Cesium.JulianDate.now()).toCssColorString()
      };
    }

    if (entity.polyline) {
      jsonEntity.polyline = {
        positions: entity.polyline.positions.getValue(Cesium.JulianDate.now()),
        width: entity.polyline.width.getValue(Cesium.JulianDate.now()),
        material: entity.polyline.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.polygon) {
      jsonEntity.polygon = {
        hierarchy: entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions,
        material: entity.polygon.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.ellipse) {
      jsonEntity.ellipse = {
        semiMinorAxis: entity.ellipse.semiMinorAxis.getValue(Cesium.JulianDate.now()),
        semiMajorAxis: entity.ellipse.semiMajorAxis.getValue(Cesium.JulianDate.now()),
        material: entity.ellipse.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.corridor) {
      jsonEntity.corridor = {
        positions: entity.corridor.positions.getValue(Cesium.JulianDate.now()),
        width: entity.corridor.width.getValue(Cesium.JulianDate.now()),
        material: entity.corridor.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.ellipsoid) {
      jsonEntity.ellipsoid = {
        radii: entity.ellipsoid.radii.getValue(Cesium.JulianDate.now()),
        material: entity.ellipsoid.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.rectangle) {
      jsonEntity.rectangle = {
        coordinates: entity.rectangle.coordinates.getValue(Cesium.JulianDate.now()),
        material: entity.rectangle.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.path) {
      jsonEntity.path = {
        material: entity.path.material.uniforms.color.toCssColorString(),
        width: entity.path.width.getValue(Cesium.JulianDate.now())
      };
    }

    if (entity.tileset) {
      jsonEntity.tileset = {
        uri: entity.tileset.uri.getValue(Cesium.JulianDate.now())
      };
    }

    if (entity.model) {
      jsonEntity.model = {
        uri: entity.model.uri.getValue(Cesium.JulianDate.now()),
        minimumPixelSize: entity.model.minimumPixelSize,
        maximumScale: entity.model.maximumScale
      };
    }

    if (entity.label) {
      jsonEntity.label = {
        text: entity.label.text.getValue(Cesium.JulianDate.now()),
        font: entity.label.font.getValue(Cesium.JulianDate.now()),
        fillColor: entity.label.fillColor.getValue(Cesium.JulianDate.now()).toCssColorString()
      };
    }

    if (entity.plane) {
      jsonEntity.plane = {
        plane: {
          normal: entity.plane.plane.normal,
          distance: entity.plane.plane.distance
        },
        dimensions: entity.plane.dimensions.getValue(Cesium.JulianDate.now()),
        material: entity.plane.material.uniforms.color.toCssColorString()
      };
    }

    if (entity.wall) {
      jsonEntity.wall = {
        positions: entity.wall.positions.getValue(Cesium.JulianDate.now()),
        material: entity.wall.material.uniforms.color.toCssColorString()
      };
    }

    return jsonEntity;
  });
}

const entitiesJson = entitiesToJson(viewer.entities);
console.log(JSON.stringify(entitiesJson, null, 2));

// 导出 JSON 文件
function downloadJson(data, filename = 'entities.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

downloadJson(entitiesJson);
