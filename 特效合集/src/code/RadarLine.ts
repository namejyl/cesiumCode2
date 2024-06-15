const Cesium = window.Cesium;
export default () => {
  let x = 117.141411;
  let y = 36.19;
  let z = 0;
  class RadarLineMaterialProperty {
    constructor(options) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._speed = undefined;
      this.color = options.color;
      this.speed = options.speed;
    }

    get isConstant() {
      return false;
    }

    get definitionChanged() {
      return this._definitionChanged;
    }

    getType(time) {
      return Cesium.Material.RadarLineMaterialType;
    }

    getValue(time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }

      result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
      result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
      return result;
    }

    equals(other) {
      return this === other || (other instanceof RadarLineMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
    }
  }

  Object.defineProperties(RadarLineMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed')
  });

  Cesium.RadarLineMaterialProperty = RadarLineMaterialProperty;
  Cesium.Material.RadarLineMaterialProperty = 'RadarLineMaterialProperty';
  Cesium.Material.RadarLineMaterialType = 'RadarLineMaterialType';
  Cesium.Material.RadarLineMaterialSource = `
uniform vec4 color;
uniform float speed;

czm_material czm_getMaterial(czm_materialInput materialInput){
czm_material material = czm_getDefaultMaterial(materialInput);
vec2 st = materialInput.st * 2.0 - 1.0;
float t = czm_frameNumber * speed / 1000.0 ;
vec3 col = vec3(0.0);
vec2 p = vec2(sin(t), cos(t));
float d = length(st - dot(p, st) * p);
if (dot(st, p) < 0.) {
    d = length(st);
}

col = .006 / d * color.rgb;

if(distance(st,vec2(0)) >  0.99 ){
    col =color.rgb;
}

material.alpha  = pow(length(col),2.0);
material.diffuse = col * 3.0 ;
return material;
}
 `;

  Cesium.Material._materialCache.addMaterial(Cesium.Material.RadarLineMaterialType, {
    fabric: {
      type: Cesium.Material.RadarLineMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 10.0
      },
      source: Cesium.Material.RadarLineMaterialSource
    },
    translucent: function (material) {
      return true;
    }
  });

  // 雷达线
  let entity = window.viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(x, y),
    id: 'radarLine',
    name: '雷达线',
    ellipse: {
      semiMajorAxis: 1000.0,
      semiMinorAxis: 1000.0,
      material: new Cesium.RadarLineMaterialProperty({
        color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
        speed: 20.0
      })
    }
  });
  viewer.zoomTo(entity);
};
