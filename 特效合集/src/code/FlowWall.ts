const Cesium = window.Cesium;
import arrowImg from '/static/arrow.png';
import axios from 'axios';
const FlowWall = () => {
  axios.get('/static/geojson/财源街道边界.geojson').then(res => {
    let array = [];
    let list = res.data.features[0].geometry.coordinates[0][0];
    for (let i = 0; i < list.length; i++) {
      array.push(list[i][0]);
      array.push(list[i][1]);
    }
    FlowWallFn(array);
  });
};
export default FlowWall;

/**
 * 动态流动墙体效果
 * @param {Array} polygonArray 坐标数组
 */
function FlowWallFn(polygonArray) {
  const viewer = window.viewer;
  //流动墙材质
  function TrailLineMaterialProperty(options) {
    // 默认参数设置
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color;
    this.duration = options.duration;
    this._time = new Date().getTime();
  }
  Object.defineProperties(TrailLineMaterialProperty.prototype, {
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
  TrailLineMaterialProperty.prototype.getType = function (time) {
    return 'TrailLine';
  };
  TrailLineMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);

    if (this.duration) {
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
    }
    viewer.scene.requestRender();
    return result;
  };
  TrailLineMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof TrailLineMaterialProperty && Cesium.Property.equals(this._color, other._color));
  };
  Cesium.TrailLineMaterialProperty = TrailLineMaterialProperty;
  Cesium.Material.TrailLineType = 'TrailLine';
  Cesium.Material.TrailLineImage = arrowImg;
  Cesium.Material.TrailLineSource =
    'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
   czm_material material = czm_getDefaultMaterial(materialInput);\n\
   vec2 st = materialInput.st;\n\
   vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));\n\
   material.alpha = colorImage.a * color.a;\n\
   material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
   return material;\n\
}';
  Cesium.Material._materialCache.addMaterial(Cesium.Material.TrailLineType, {
    fabric: {
      type: Cesium.Material.TrailLineType,
      uniforms: {
        color: new Cesium.Color(1.0, 1.0, 1.0, 1),
        image: Cesium.Material.TrailLineImage,
        time: 0
      },
      source: Cesium.Material.TrailLineSource
    },
    translucent: function (material) {
      return true;
    }
  });
  for (let i = 0; i < viewer.entities.values.length; i++) {
    if (viewer.entities.values[i].id == 'flowWall') {
      viewer.entities.remove(viewer.entities.values[i]);
    }
  }
  let entity = viewer.entities.add({
    name: '流动墙效果',
    id: 'flowWall',
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
      // 设置高度
      maximumHeights: new Array(polygonArray.length / 2).fill(840),
      minimunHeights: new Array(polygonArray.length / 2).fill(600),
      material: new Cesium.TrailLineMaterialProperty({
        color: Cesium.Color.RED,
        duration: 18000
      })
    }
  });
  viewer.zoomTo(entity);
}
