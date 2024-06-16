const Cesium = window.Cesium;
const VisibilityAnalysis = async () => {
  // 通视分析
  let viewer = window.viewer;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(103.5351278866, 31.5910777889, 8000.0)
  });
  //深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;
  const vaObj = new VisibilityAnalysis2(viewer);
};
export default VisibilityAnalysis;

class VisibilityAnalysis2 {
  constructor(viewer) {
    if (!viewer) throw new Error('no viewer object!');
    this.viewer = viewer;
    this.resultObject = {
      viewPoint: undefined, //通视分析起点
      targetPoints: [], //通视分析目标点集合
      targetPoint: undefined, //当前目标点
      objectExclude: [], //射线排除集合
      entities: [] //创建的Entity对象
    };
    this.init();
  }
  init() {
    const $this = this;
    let toolTip = '左键点击创建视角起点';
    const handler = new Cesium.ScreenSpaceEventHandler($this.viewer.canvas);
    handler.setInputAction(event => {
      let cartesian = getCatesian3FromPX($this.viewer, event.position);
      toolTip = '左键创建视角终点，右键结束通视分析';
      if (cartesian) {
        if (!$this.resultObject.viewPoint) {
          $this.resultObject.viewPoint = cartesian;
          let pointEntity = $this.viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.YELLOW,
              pixelSize: 5
            }
          });
          $this.resultObject.objectExclude.push(pointEntity);
          $this.resultObject.entities.push(pointEntity);
        } else {
          $this.resultObject.targetPoint = cartesian;
          let pointEntity = $this.viewer.entities.add({
            position: cartesian,
            point: {
              color: Cesium.Color.YELLOW,
              pixelSize: 5
            }
          });
          $this.resultObject.objectExclude.push(pointEntity);
          $this.resultObject.entities.push(pointEntity);
          let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract($this.resultObject.targetPoint, $this.resultObject.viewPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());

          let ray = new Cesium.Ray($this.resultObject.viewPoint, direction);
          let result = $this.viewer.scene.pickFromRay(ray, $this.resultObject.objectExclude); // 计算交互点，返回第一个
          if (result) {
            let dis0 = $this.distance($this.resultObject.viewPoint, $this.resultObject.targetPoint);
            let dis1 = $this.distance($this.resultObject.viewPoint, result.position);
            let dis2 = $this.distance(result.position, $this.resultObject.targetPoint);
            console.log(dis0, dis1, dis2);
            if (dis0 > dis1) {
              let _poly0 = $this.viewer.entities.add({
                polyline: {
                  positions: [$this.resultObject.viewPoint, result.position],
                  material: Cesium.Color.GREEN,
                  width: 3
                }
              });
              $this.resultObject.entities.push(_poly0);
              let _poly1 = $this.viewer.entities.add({
                polyline: {
                  positions: [result.position, $this.resultObject.targetPoint],
                  material: Cesium.Color.RED,
                  width: 3
                }
              });
              $this.resultObject.entities.push(_poly1);
              $this.resultObject.targetPoints.push({
                targetPoint: cartesian,
                visual: false, //如果dis2足够小，其实他是可视的
                distance: [dis0, dis1, dis2] //[初始点和终点，初始点和交点，交点和终点]
              });
            } else {
              let _poly2 = $this.viewer.entities.add({
                polyline: {
                  positions: [$this.resultObject.viewPoint, $this.resultObject.targetPoint],
                  material: Cesium.Color.GREEN,
                  width: 3
                }
              });
              $this.resultObject.entities.push(_poly2);
              $this.resultObject.targetPoints.push({
                targetPoint: cartesian,
                visual: true, //如果dis2足够小，其实他是可视的
                distance: [dis0, dis1, dis2] //[初始点和终点，初始点和交点，交点和终点]
              });
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function (move) {
      CreateRemindertip(toolTip, move.endPosition, true);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(event => {
      CreateRemindertip(toolTip, event.endPosition, false);
      handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  //空间两点间距离
  distance(point1, point2) {
    let point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    let point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    let geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
    return s;
  }
  clearAll() {
    this.resultObject.entity.forEach(element => {
      this.viewer.entities.remove(element);
    });
    this.resultObject = {
      viewPoint: undefined, //通视分析起点
      targetPoints: [], //通视分析目标点集合
      targetPoint: undefined, //当前目标点
      objectExclude: [], //射线排除集合
      entities: [] //创建的Entity对象
    };
  }
}
function getCatesian3FromPX(viewer, px) {
  let picks = viewer.scene.drillPick(px);
  let cartesian = null;
  let isOn3dtiles = false,
    isOnTerrain = false;
  // drillPick
  for (let i in picks) {
    let pick = picks[i];
    if ((pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) || (pick && pick.primitive instanceof Cesium.Cesium3DTileset) || (pick && pick.primitive instanceof Cesium.Model)) {
      //模型上拾取
      isOn3dtiles = true;
    }
    // 3dtilset
    if (isOn3dtiles) {
      viewer.scene.pick(px); // pick
      cartesian = viewer.scene.pickPosition(px);
      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        let lon = Cesium.Math.toDegrees(cartographic.longitude),
          lat = Cesium.Math.toDegrees(cartographic.latitude),
          height = cartographic.height;
        cartesian = transformWGS84ToCartesian(viewer, {
          lng: lon,
          lat: lat,
          alt: height
        });
      }
    }
  }
  // 地形
  let boolTerrain = viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
  // Terrain
  if (!isOn3dtiles && !boolTerrain) {
    let ray = viewer.scene.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    isOnTerrain = true;
  }
  // 地球
  if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
    cartesian = viewer.scene.camera.pickEllipsoid(px, viewer.scene.globe.ellipsoid);
  }
  if (cartesian) {
    let position = transformCartesianToWGS84(viewer, cartesian);
    if (position.alt < 0) {
      cartesian = transformWGS84ToCartesian(viewer, position, 0.1);
    }
    return cartesian;
  }
  return false;
}

/***
 * 坐标转换 84转笛卡尔
 * @param {Object} {lng,lat,alt} 地理坐标
 * @return {Object} Cartesian3 三维位置坐标
 */
function transformWGS84ToCartesian(viewer, position, alt) {
  return position ? Cesium.Cartesian3.fromDegrees(position.lng || position.lon, position.lat, (position.alt = alt || position.alt), Cesium.Ellipsoid.WGS84) : Cesium.Cartesian3.ZERO;
}

/***
 * 坐标转换 笛卡尔转84
 * @param {Object} Cartesian3 三维位置坐标
 * @return {Object} {lng,lat,alt} 地理坐标
 */
function transformCartesianToWGS84(viewer, cartesian) {
  let ellipsoid = Cesium.Ellipsoid.WGS84;
  let cartographic = ellipsoid.cartesianToCartographic(cartesian);
  return {
    lng: Cesium.Math.toDegrees(cartographic.longitude),
    lat: Cesium.Math.toDegrees(cartographic.latitude),
    alt: cartographic.height
  };
}

// cesium 绘制toolTip
const CreateRemindertip = function (toolTip, position, show, arr) {
  let tooltip = document.getElementById('toolTip');
  let style, _x, _y, _color;
  if (arr && typeof arr === 'object') {
    style = arr;
  }
  if (style && style.origin) {
    style.origin === 'center' && ((_x = 15), (_y = -12));
    style.origin === 'top' && ((_x = 15), (_y = -44));
    style.origin === 'bottom' && ((_x = 15), (_y = 20));
  } else {
    (_x = 15), (_y = 20);
  }
  if (style && style.color) {
    style.color === 'white' && (_color = 'background: rgba(255, 255, 255, 0.8);color: black;');
    style.color === 'black' && (_color = 'background: rgba(0, 0, 0, 0.5);color: white;');
    style.color === 'yellow' && (_color = 'color: black;background-color: #ffcc33;border: 1px solid white;');
  } else {
    _color = 'background: rgba(0, 0, 0, 0.5);color: white;';
  }
  if (!tooltip) {
    const viewerDom = document.getElementsByClassName('cesium-viewer')[0];
    let elementbottom = document.createElement('div');
    viewerDom.append(elementbottom);
    // padding: 4px 8px;
    let html = '<div id="toolTip" style="display: none;pointer-events: none;position: absolute;z-index: 1000;opacity: 0.8;border-radius: 4px;white-space: nowrap;font-family:黑体;color:white;font-weight: bolder;font-size: 14px;' + _color + '"></div>';
    viewerDom.insertAdjacentHTML('beforeend', html);
    tooltip = document.getElementById('toolTip');
  }
  if (show) {
    tooltip.innerHTML = arr;
    tooltip.style.left = position.x + _x + 'px';
    tooltip.style.top = position.y + _y + 'px';
    tooltip.style.display = 'block';
    showAt(position, toolTip);
  } else {
    tooltip.style.display = 'none';
    show(show);
  }

  function showAt(position, text) {
    tooltip.innerHTML = text;
    if (style && style.origin) {
      style.origin === 'center' && ((_x = 15), (_y = -tooltip.offsetHeight / 2));
      style.origin === 'top' && ((_x = 15), (_y = -tooltipp.offsetHeight - 20));
      style.origin === 'bottom' && ((_x = 15), (_y = 20));
    } else {
      (_x = 15), (_y = -tooltip.offsetHeight / 2);
    }
    tooltip.style.left = position.x + _x + 'px';
    tooltip.style.top = position.y + _y + 'px';
    tooltip.style.display = 'block';
  }
  function show(show) {
    if (show) {
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  }
};
