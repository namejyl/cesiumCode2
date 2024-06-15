const Cesium = window.Cesium;
export default () => {
  let viewer = window.Viewer;
  // geojson数据路径
  let geojsonPath = '/static/geojson/泰山区道路.geojson';
  // 线颜色
  let polylineColor = '#00FFFF';
  // Load the road data (example using GeoJSON).
  Cesium.GeoJsonDataSource.load(geojsonPath).then(function (dataSource: any) {
    viewer.dataSources.add(dataSource);
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      // Create a polyline with a flow material.
      entity.polyline.material = new Cesium.PolylineTrailMaterialProperty({
        color: Cesium.Color.fromCssColorString(polylineColor),
        trailLength: 300,
        period: 6.0
      });
    }
  });

  // Define the custom material for the flowing effect.
  Cesium.Material.PolylineTrailType = 'PolylineTrail';
  Cesium.Material.PolylineTrailSource = `
      czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;

          float alpha = smoothstep(0.0, 0.1, fract(czm_frameNumber / 60.0)) * smoothstep(1.0, 0.9, fract(czm_frameNumber / 60.0));
          material.diffuse = 1.5 * color.rgb;
          material.alpha = alpha;
          return material;
      }
  `;

  Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
    fabric: {
      type: Cesium.Material.PolylineTrailType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.5, 0.0, 1.0)
      },
      source: Cesium.Material.PolylineTrailSource
    },
    translucent: function () {
      return true;
    }
  });

  Cesium.PolylineTrailMaterialProperty = function (options: any) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color;
    this.trailLength = options.trailLength;
    this.period = options.period;
  };

  Object.defineProperties(Cesium.PolylineTrailMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false;
      }
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      }
    },
    color: Cesium.createPropertyDescriptor('color')
  });

  Cesium.PolylineTrailMaterialProperty.prototype.getType = function (time: any) {
    return Cesium.Material.PolylineTrailType;
  };

  Cesium.PolylineTrailMaterialProperty.prototype.getValue = function (time: any, result: any) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    return result;
  };

  Cesium.PolylineTrailMaterialProperty.prototype.equals = function (other: any) {
    return this === other || (other instanceof Cesium.PolylineTrailMaterialProperty && Cesium.Property.equals(this._color, other._color));
  };

  Cesium.PolylineTrailMaterialProperty.prototype.addMaterial = function (options: any) {
    var viewer = options.viewer;
    var entity = options.entity;
    var color = options.color || Cesium.Color.ORANGE;
    var trailLength = options.trailLength || 300;
    var period = options.period || 6.0;
    entity.polyline.material = new Cesium.PolylineTrailMaterialProperty({
      color: color,
      trailLength: trailLength,
      period: period
    });
  };
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.1026333, 36.2059026, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
};
