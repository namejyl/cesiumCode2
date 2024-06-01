const Cesium = window.Cesium;
import colorsImg from '/static/colors.png';
import axios from 'axios';
const DynamicWall = () => {
  axios.get('/static/geojson/岱岳区水域.geojson').then(res => {
    let array = [];
    let list = res.data.features[200].geometry.coordinates[0][0];
    for (let i = 0; i < list.length; i++) {
      array.push(list[i][0]);
      array.push(list[i][1]);
    }
    DynamicWallFn(array);
  });
};
export default DynamicWall;

/**
 * 动态立体墙效果
 * @param {Array} polygonArray 坐标数组
 */
function DynamicWallFn(polygonArray) {
  const viewer = window.viewer;
  //动态墙材质
  function DynamicWallMaterialProperty(options) {
    // 默认参数设置
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color;
    this.duration = options.duration;
    this.trailImage = options.trailImage;
    this._time = new Date().getTime();
  }
  Object.defineProperties(DynamicWallMaterialProperty.prototype, {
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
  DynamicWallMaterialProperty.prototype.getType = function (time) {
    return 'DynamicWall';
  };
  DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    if (this.trailImage) {
      result.image = this.trailImage;
    } else {
      result.image = Cesium.Material.DynamicWallImage;
    }

    if (this.duration) {
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
    }
    viewer.scene.requestRender();
    return result;
  };
  DynamicWallMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof DynamicWallMaterialProperty && Cesium.Property.equals(this._color, other._color));
  };
  Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;
  Cesium.Material.DynamicWallType = 'DynamicWall';
  Cesium.Material.DynamicWallImage = colorsImg;
  Cesium.Material.DynamicWallSource =
    'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                          {\n\
                                          czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                          vec2 st = materialInput.st;\n\
                                          vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));\n\
                                          vec4 fragColor;\n\
                                          fragColor.rgb = color.rgb / 1.0;\n\
                                          fragColor = czm_gammaCorrect(fragColor);\n\
                                          material.alpha = colorImage.a * color.a;\n\
                                          material.diffuse = color.rgb;\n\
                                          material.emission = fragColor.rgb;\n\
                                          return material;\n\
                                          }';
  Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
    fabric: {
      type: Cesium.Material.DynamicWallType,
      uniforms: {
        color: new Cesium.Color(1.0, 1.0, 1.0, 1),
        image: Cesium.Material.DynamicWallImage,
        time: 0
      },
      source: Cesium.Material.DynamicWallSource
    },
    translucent: function (material) {
      return true;
    }
  });
  for (let i = 0; i < viewer.entities.values.length; i++) {
    if (viewer.entities.values[i].id == 'dynamicWall') {
      viewer.entities.remove(viewer.entities.values[i]);
    }
  }
  // 绘制墙体
  let entity = viewer.entities.add({
    name: '立体墙效果',
    id: 'dynamicWall',
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
      // 设置高度
      maximumHeights: new Array(polygonArray.length / 2).fill(600),
      minimunHeights: new Array(polygonArray.length / 2).fill(0),
      material: new Cesium.DynamicWallMaterialProperty({
        color: Cesium.Color.fromBytes(55, 96, 56).withAlpha(0.7),
        duration: 3000
      })
    }
  });
  viewer.zoomTo(entity);
}
