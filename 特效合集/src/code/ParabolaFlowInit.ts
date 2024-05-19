const Cesium = window.Cesium;
const ParabolaFlowInit = () => {
  let center = [117.123076, 36.214848];
  let num = 20;
  ParabolaFlowInitFn(center, num);
};
export default ParabolaFlowInit;

/**
 * 抛物流动飞线效果
 * @param {Array} positions 线的坐标
 * @param {Number} num      飞线数量
 */
function ParabolaFlowInitFn(center: any, num: any) {
  class LineFlowMaterialProperty {
    _definitionChanged: any;
    _color: any;
    _speed: any;
    _percent: any;
    _gradient: any;
    color: any;
    speed: any;
    percent: any;
    gradient: any;
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
  let list = [];
  for (let i = 0; i < num; i++) {
    // random产生的随机数范围是0-1，需要加上正负模拟
    let lon = center[0] + Math.random() * 0.1 * (i % 2 == 0 ? 1 : -1);
    let lat = center[1] + Math.random() * 0.1 * (i % 2 == 0 ? 1 : -1);
    list.push([lon, lat]);
  }
  list.forEach(item => {
    let _siglePositions = parabola(center, item, 5000);
    // 创建飞线
    for (let i = 0; i < num; i++) {
      viewer.entities.add({
        polyline: {
          positions: _siglePositions,
          material: new Cesium.LineFlowMaterialProperty({
            color: new Cesium.Color(1.0, 1.0, 0.0, 0.8),
            speed: 15 * Math.random(),
            percent: 0.1,
            gradient: 0.01
          })
        }
      });
    }
    // 创建轨迹线
    viewer.entities.add({
      polyline: {
        positions: _siglePositions,
        material: new Cesium.Color(1.0, 1.0, 0.0, 0.2)
      }
    });
  });

  /**
   * @description: 抛物线构造函数（参考开源代码）
   * @param {*}
   * @return {*}
   */
  function parabola(startPosition: any, endPosition: any, height = 0, count = 50) {
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    let result = [];
    height = Math.max(+height, 100);
    count = Math.max(+count, 50);
    let diffLon = Math.abs(startPosition[0] - endPosition[0]);
    let diffLat = Math.abs(startPosition[1] - endPosition[1]);
    let L = Math.max(diffLon, diffLat);
    let dlt = L / count;
    if (diffLon > diffLat) {
      //base on lon
      let delLat = (endPosition[1] - startPosition[1]) / count;
      if (startPosition[0] - endPosition[0] > 0) {
        dlt = -dlt;
      }
      for (let i = 0; i < count; i++) {
        let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
        let lon = startPosition[0] + dlt * i;
        let lat = startPosition[1] + delLat * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    } else {
      //base on lat
      let delLon = (endPosition[0] - startPosition[0]) / count;
      if (startPosition[1] - endPosition[1] > 0) {
        dlt = -dlt;
      }
      for (let i = 0; i < count; i++) {
        let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
        let lon = startPosition[0] + delLon * i;
        let lat = startPosition[1] + dlt * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    }
    return result;
  }
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.123076, 36.214848, 15000.0), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0
    },
    duration: 5
  });
}
