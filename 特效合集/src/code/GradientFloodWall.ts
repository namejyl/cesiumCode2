const Cesium = window.Cesium;
import axios from 'axios';
const GradientFloodWall = () => {
  axios.get('/static/geojson/财源街道边界.geojson').then(res => {
    let array = [];
    let list = res.data.features[0].geometry.coordinates[0][0];
    for (let i = 0; i < list.length; i++) {
      array.push(list[i][0]);
      array.push(list[i][1]);
    }
    GradientFloodWallFn(array);
  });
};
export default GradientFloodWall;

/**
 * 立体墙（垂直、水平）渐变泛光效果
 * @param {Array} positions 墙的节点位置
 */
function GradientFloodWallFn(positions) {
  // 材质
  class WallDiffuseMaterialProperty {
    constructor(options) {
      this._definitionChanged = new Cesium.Event();
      this._color = undefined;
      this.color = options.color;
    }

    get isConstant() {
      return false;
    }

    get definitionChanged() {
      return this._definitionChanged;
    }

    getType(time) {
      return Cesium.Material.WallDiffuseMaterialType;
    }

    getValue(time, result) {
      if (!Cesium.defined(result)) {
        result = {};
      }

      result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
      return result;
    }

    equals(other) {
      return this === other || (other instanceof WallDiffuseMaterialProperty && Cesium.Property.equals(this._color, other._color));
    }
  }

  Object.defineProperties(WallDiffuseMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color')
  });

  Cesium.WallDiffuseMaterialProperty = WallDiffuseMaterialProperty;
  Cesium.Material.WallDiffuseMaterialProperty = 'WallDiffuseMaterialProperty';
  Cesium.Material.WallDiffuseMaterialType = 'WallDiffuseMaterialType';
  // 立体向下渐变效果：material.alpha = color.a * (fract(st.t)) * 0.8;
  // 水平逆时针渐变效果：material.alpha = color.a * (fract(st.s)) * 0.8;
  // 水平顺时针渐变效果：material.alpha = color.a * (1.0 - fract(st.s)) * 0.8;
  Cesium.Material.WallDiffuseMaterialSource = `
  uniform vec4 color;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  material.diffuse = color.rgb * 2.0;
  material.alpha = color.a * (1.0 - fract(st.t)) * 0.8;
  return material;
  }
                                          
  `;

  Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseMaterialType, {
    fabric: {
      type: Cesium.Material.WallDiffuseMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0)
      },
      source: Cesium.Material.WallDiffuseMaterialSource
    },
    translucent: function (material) {
      return true;
    }
  });

  // 绘制墙体
  let entity = window.viewer.entities.add({
    name: '立体墙效果',
    id: 'GradientFloodWall',
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArray(positions),
      // 设置高度
      maximumHeights: new Array(positions.length / 2).fill(840),
      minimunHeights: new Array(positions.length / 2).fill(0),
      // 扩散墙材质
      material: new Cesium.WallDiffuseMaterialProperty({
        color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
      })
    }
  });
  viewer.zoomTo(entity);
}
