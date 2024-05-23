const Cesium = window.Cesium;
const AddTiandituWmts = () => {
  let x = 117.141411;
  let y = 36.19;
  let z = 0;
  window.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(x, y, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
  class CirclePulseMaterialProperty {
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
      return Cesium.Material.CirclePulseMaterialType;
    }

    getValue(time, result) {
      result = Cesium.defaultValue(result, {});
      result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
      result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
      return result;
    }

    equals(other) {
      return this === other || (other instanceof CirclePulseMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed));
    }
  }

  // 设置属性
  Object.defineProperties(CirclePulseMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed')
  });

  Cesium.CirclePulseMaterialProperty = CirclePulseMaterialProperty;
  Cesium.Material.CirclePulseMaterialProperty = 'CirclePulseMaterialProperty';
  Cesium.Material.CirclePulseMaterialType = 'CirclePulseMaterialType';
  Cesium.Material.CirclePulseMaterialSource = `
                                        uniform vec4 color;
                                        uniform float speed;
                                        czm_material czm_getMaterial(czm_materialInput materialInput) {
                                            czm_material material = czm_getDefaultMaterial(materialInput);
                                            vec2 st = materialInput.st * 2.0 - 1.0;
                                            float time = fract(czm_frameNumber * speed / 1000.0);
                                            float r = length(st) * 1.2;
                                            float a = pow(r, 2.0);
                                            float b = sin(r * 0.8 - 1.6);
                                            float c = sin(r - 0.010);
                                            float s = sin(a - time * 2.0 + b) * c;
                                            float d = abs(1.0 / (s * 10.8)) - 0.01;
                                            material.alpha = pow(d, 10.0);
                                            material.diffuse = color.rgb * d;
                                            return material;
                                        }
                                        `;
  Cesium.Material._materialCache.addMaterial(Cesium.Material.CirclePulseMaterialType, {
    fabric: {
      type: Cesium.Material.CirclePulseMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 10.0
      },
      source: Cesium.Material.CirclePulseMaterialSource
    },
    translucent: function (material) {
      return true;
    }
  });

  // 脉冲圆特效
  window.viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(x, y),
    id: 'pulseCircle',
    name: '脉冲圆',
    ellipse: {
      semiMinorAxis: 1000.0,
      semiMajorAxis: 1000.0,
      material: new Cesium.CirclePulseMaterialProperty({
        color: new Cesium.Color(1, 1, 0, 0.7),
        speed: 12.0
      })
    }
  });
};
export default AddTiandituWmts;
