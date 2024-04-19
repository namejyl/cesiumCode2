/*
 * 防御、进攻阵型标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 15:08:04
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import {
  newSessionid,
  calculateFormationPoints,
} from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateFormation = (
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
  const width = options.width || 5;
  const onground = options.onground || true;
  const type = options.type || 0; //0-防御阵型；1-进攻阵型
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = []; //记录阵型的两个端点
  let formationPolyline: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    let pos = getCatesian3FromPX(viewer, event.position);
    if (!pos || Cesium.defined(formationPolyline)) return;
    anchorpoints.push(pos);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return calculateFormationPoints(anchorpoints, type);
    }, false);
    formationPolyline = viewer.entities.add({
      name: 'Formation',
      id: id,
      polyline: {
        positions: dynamicPositions,
        width: width,
        material: color,
        clampToGround: onground,
      },
    });
    formationPolyline.GeoType = 'Formation'; //记录对象的类型，用户后续编辑等操作
    formationPolyline.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    formationPolyline.GeoNum = type; //代表当前对象类型标记，防御或者进攻
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建阵型------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (!Cesium.defined(formationPolyline)) return;
    const endCartesian = getCatesian3FromPX(viewer, endPos);
    if (!endCartesian) return;
    if (anchorpoints.length > 1) {
      anchorpoints.pop();
    }
    anchorpoints.push(endCartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    formationPolyline.polyline.positions = calculateFormationPoints(
      anchorpoints,
      type
    );
    formationPolyline.PottingPoint = Cesium.clone(anchorpoints, true);
    formationPolyline.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(formationPolyline);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(formationPolyline);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateFormation;