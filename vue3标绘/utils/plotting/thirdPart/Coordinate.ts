/*
 * 地图坐标相关方法
 * @Author: Wang jianLei
 * @Date: 2023-01-13 11:01:32
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2023-01-13 14:29:28
 */
const Cesium = window.Cesium;
/**
 * 获取屏幕中心点坐标，参数传空返回笛卡尔坐标
 * @param type "cartesian"-笛卡尔，"degree"-经纬度
 * @returns {object} {x,y,z}
 */
const getCameraCentor = (type: string | undefined) => {
  const viewer = window.Viewer;
  const cartesian2 = new Cesium.Cartesian2(
    viewer.canvas.clientWidth / 2,
    viewer.canvas.clientHeight / 2
  );
  const cartesian3 = getCatesian3FromPX(viewer, cartesian2);
  return type === 'degree' ? transformCartesianToWGS84(cartesian3) : cartesian3;
};
/**
 * 经纬度转笛卡尔坐标
 * @param position - { x, y, z }
 * @returns {Object} Cartesian3
 */
const transformWGS84ToCartesian = (position: {
  x: number;
  y: number;
  z?: number;
}) => {
  return position
    ? Cesium.Cartesian3.fromDegrees(
        position.x,
        position.y,
        position.z,
        Cesium.Ellipsoid.WGS84
      )
    : Cesium.Cartesian3.ZERO;
};
/**
 * 笛卡尔坐标转经纬度
 * @param cartesian Cartesian3
 * @returns {Object} { x, y, z }
 */
const transformCartesianToWGS84 = (cartesian: any) => {
  let ellipsoid = Cesium.Ellipsoid.WGS84;
  let cartographic = ellipsoid.cartesianToCartographic(cartesian);
  const x: number = Cesium.Math.toDegrees(cartographic.longitude);
  const y: number = Cesium.Math.toDegrees(cartographic.latitude);
  const z: number = cartographic.height;
  return { x, y, z };
};
/**
 * 经纬度坐标由十进制度转度分秒
 * @param position - { x, y, z }
 * @returns - { x:[], y:[] }
 */
const transformWGS84ToDMS = (position: {
  x: number;
  y: number;
  z?: number;
}) => {
  const x = transformDegreeToDMS(position.x);
  const y = transformDegreeToDMS(position.y);
  return { x, y };
};
/**
 * 经纬度坐标由度分秒转十进制度
 * @param dms - { x:[], y:[] }
 * @returns - { x, y }
 */
const transformDMSToWGS84 = (dms: { x: number[]; y: number[] }) => {
  const x = transformDMSToDegree(dms.x);
  const y = transformDMSToDegree(dms.y);
  return { x, y };
};
/**
 * 十进制度转度分秒
 * @param degree 十进制度坐标值
 * @returns [ degrees, minutes, seconds ]
 */
const transformDegreeToDMS = (degree: number) => {
  const value = degree.toString();
  let i = value.indexOf('.');
  let _degrees = i < 0 ? degree : Number(value.substring(0, i)); //获取度
  let _minutes = 0;
  let _seconds = 0;
  if (i > 0) {
    const minutes = Number(value.substring(i)) * 60;
    const strMinutes = minutes.toString();
    const n = strMinutes.indexOf('.');
    _minutes = n < 0 ? minutes : Number(strMinutes.substring(0, n));
    if (n > 0) {
      const seconds = Number(strMinutes.substring(n)) * 60;
      _seconds = Number(seconds.toFixed(2));
    }
  }
  return [_degrees, _minutes, _seconds];
};
/**
 * 度分秒转十进制度
 * @param dms 度分秒坐标值
 * @returns 十进制度坐标值
 */
const transformDMSToDegree = (dms: number[]) => {
  const _degrees = dms[0];
  const _minutes = dms[1] ? dms[1] / 60 : 0;
  const _seconds = dms[2] ? dms[2] / 3600 : 0;
  const dmsResult = _degrees + _minutes + _seconds;
  return dmsResult;
};
 
/**
 * 获取屏幕点的笛卡尔坐标
 * @param viewer 三维场景viewer
 * @param px 屏幕像素点
 * @returns {Object} Cartesian3 | null
 */
const getCatesian3FromPX = (viewer: any, px: { x: number; y: number }) => {
  let cartesian = null;
  let isOn3dtiles = false;
  let isOnTerrain = false;
  // drillPick
  let picks = viewer.scene.drillPick(px);
  for (let i in picks) {
    let pick = picks[i];
    if (
      (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
      (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
      (pick && pick.primitive instanceof Cesium.Model)
    ) {
      //模型上拾取位置点
      isOn3dtiles = true;
      return viewer.scene.pickPosition(px);
    }
  }
  let noTerrain =
    viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider; // 判断是否有地形
  // 在地形上拾取位置点
  if (!isOn3dtiles && !noTerrain) {
    let ray = viewer.scene.camera.getPickRay(px);
    if (!ray) return null;
    isOnTerrain = true;
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  }
  // 在普通地球上拾取位置点
  if (!isOn3dtiles && !isOnTerrain && noTerrain) {
    cartesian = viewer.scene.camera.pickEllipsoid(
      px,
      viewer.scene.globe.ellipsoid
    );
  }
  return cartesian;
};
 
/*
 * 计算两点对于正北方向的朝向角度 [0,360]
 * @param {*} start format:{'x': 130, 'y': 20 }
 * @param {*} end
 */
 
/**
 * 计算两点对于正北方向的朝向角度 [0,360]
 * @param start format:{'x': 130, 'y': 20 }
 * @param end format:{'x': 130, 'y': 20 }
 * @returns
 */
const calculateAngle = (
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  let rad = Math.PI / 180,
    lat1 = start.y * rad,
    lat2 = end.y * rad,
    lon1 = start.x * rad,
    lon2 = end.x * rad;
  const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const b =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
 
  return radiansToDegrees(Math.atan2(a, b));
};
 
/*
 * 弧度转换为角度
 */
function radiansToDegrees(radians: number) {
  const degrees = radians % (2 * Math.PI);
  return (degrees * 180) / Math.PI < 0
    ? 360 + (degrees * 180) / Math.PI
    : (degrees * 180) / Math.PI;
}
/**
 * 计算旋转矩阵
 * @param cartesian 位置点（Cartesian3）
 * @param hpr 旋转角：[heading, pitch, roll]，单位度
 * @returns
 */
const calculateOrientation = (cartesian: any, hpr: number[]) => {
  let heading = Cesium.Math.toRadians(hpr[0]);
  //弧度的螺距分量。
  let pitch = Cesium.Math.toRadians(hpr[1]);
  //滚动分量（结果以弧度为单位）
  let roll = Cesium.Math.toRadians(hpr[2]);
  //HeadingPitchRoll旋转表示为航向，俯仰和滚动。围绕Z轴。节距是绕负y轴的旋转。滚动是关于正x轴。
  let _hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    cartesian,
    _hpr
  );
  return orientation;
};
export {
  getCameraCentor,
  getCatesian3FromPX,
  transformWGS84ToCartesian,
  transformCartesianToWGS84,
  transformDegreeToDMS,
  transformDMSToDegree,
  transformWGS84ToDMS,
  transformDMSToWGS84,
  calculateAngle,
  calculateOrientation,
};