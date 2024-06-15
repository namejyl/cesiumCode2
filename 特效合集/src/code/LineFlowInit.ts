const Cesium = window.Cesium;
export default () => {
  let list = [];
  let position = [117.123076, 36.214848];
  let num = 120;
  for (let i = 0; i < num; i++) {
    // random产生的随机数范围是0-1，需要加上正负模拟
    let lon = position[0] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
    let lat = position[1] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
    list.push([lon, lat]);
  }
  LineFlowInitFn(list);
};

/**
 * 竖直飞线效果
 * @param {Array} positions 线的坐标
 */
function LineFlowInitFn(positions: any) {
  class LineFlowMaterialProperty {
    _definitionChanged: any;
    _color: any;
    _speed: any;
    _percen: any;
    _gradient: any;
    _percent: any;
    color: any;
    speed: any;
    percen: any;
    gradient: any;
    percent: any;
    constructor(options: any) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this._speed = undefined;
      this._percent = undefined;
      this._gradient = undefined;
      this.color = options.color;
      this.speed = options.speed;
      this.percent = options.percent;
      this.gradient = options.gradient;
    }

    get isConstant() {
      return false;
    }

    get definitionChanged() {
      return this._definitionChanged;
    }

    getType(time: any) {
      return Cesium.Material.LineFlowMaterialType;
    }

    getValue(time: any, result: any) {
      if (!Cesium.defined(result)) {
        result = {};
      }

      result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
      result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
      result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
      result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
      return result;
    }

    equals(other: any) {
      return this === other || (other instanceof LineFlowMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._speed, other._speed) && Cesium.Property.equals(this._percent, other._percent) && Cesium.Property.equals(this._gradient, other._gradient));
    }
  }

  Object.defineProperties(LineFlowMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed'),
    percent: Cesium.createPropertyDescriptor('percent'),
    gradient: Cesium.createPropertyDescriptor('gradient')
  });

  Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
  Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
  Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
  Cesium.Material.LineFlowMaterialSource = `
  uniform vec4 color;
  uniform float speed;
  uniform float percent;
  uniform float gradient;
  
  czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float t =fract(czm_frameNumber * speed / 1000.0);
    t *= (1.0 + percent);
    float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
    alpha += gradient;
    material.diffuse = color.rgb;
    material.alpha = alpha;
    return material;
  }
  `;

  Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
    fabric: {
      type: Cesium.Material.LineFlowMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 10.0,
        percent: 0.1,
        gradient: 0.01
      },
      source: Cesium.Material.LineFlowMaterialSource
    },
    translucent: function (material: any) {
      return true;
    }
  });
  var viewer = window.viewer;
  positions.forEach((item: any, i: any) => {
    // 经纬度
    let start_lon = item[0];
    let start_lat = item[1];

    let startPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, 0);

    // 随机高度
    let height = 5000 * Math.random();
    let endPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, height);
    let linePositions = [];
    linePositions.push(startPoint);
    linePositions.push(endPoint);
    let entity = viewer.entities.add({
      id: '竖直飞线' + i,
      polyline: {
        positions: linePositions,
        material: new Cesium.LineFlowMaterialProperty({
          color: new Cesium.Color(1.0, 1.0, 0.0, 0.8),
          speed: 5 * Math.random(),
          percent: 0.1,
          gradient: 0.01
        })
      }
    });
    viewer.zoomTo(entity);
  });
}
