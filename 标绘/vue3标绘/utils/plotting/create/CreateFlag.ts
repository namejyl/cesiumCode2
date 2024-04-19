/*
 * 旗标标绘功能，包括 0:曲线,1:矩形.2:正三角,3:倒三角,4:对三角
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 11:04:15
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, calculateFlagPoints } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateFlag = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  const color = options.color
    ? Cesium.Color.fromCssColorString(options.color)
    : Cesium.Color.BLUE.withAlpha(0.4);
  const onground = options.onground || true;
  let type = options.type || 0; //默认绘制曲线旗标
  const flagType = {
    0: 'CurveFlag', //曲线旗标
    1: 'RectangleFlag', //矩形旗标
    2: 'RegularTriangleFlag', //正三角旗标
    3: 'InvertedTriangleFlag', //倒三角旗标
    4: 'TriangleFlag', //对三角旗标
  };
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = [];
  let flagPolygon: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
 
    let cartesian = getCatesian3FromPX(viewer, event.position);
    if (Cesium.defined(flagPolygon) || !cartesian) {
      return;
    }
    anchorpoints.push(cartesian);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      let points = calculateFlagPoints(anchorpoints, type);
      return new Cesium.PolygonHierarchy(points);
    }, false);
    flagPolygon = viewer.entities.add({
      name: flagType[type],
      id: id,
      polygon: {
        hierarchy: dynamicPositions,
        material: color,
        outline: true,
        outlineColor: Cesium.Color.GREEN,
        heightReference: onground
          ? Cesium.HeightReference.CLAMP_TO_GROUND
          : Cesium.HeightReference.NONE,
      },
    });
    flagPolygon.GeoType = flagType[type]; //记录对象的类型，用户后续编辑等操作
    flagPolygon.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    flagPolygon.GeoNum = type; //代表当前旗标类型标签
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建旗标------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (!Cesium.defined(flagPolygon)) return;
    const endCartesian = getCatesian3FromPX(viewer, endPos);
    if (!endCartesian) return;
    if (anchorpoints.length > 1) {
      anchorpoints.pop();
    }
    anchorpoints.push(endCartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    let points = calculateFlagPoints(anchorpoints, type);
    flagPolygon.polygon.hierarchy = new Cesium.PolygonHierarchy(points);
    flagPolygon.PottingPoint = Cesium.clone(anchorpoints, true);
    flagPolygon.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(flagPolygon);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(flagPolygon);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateFlag;