/*
 * 曲线标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-17 15:04:31
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 16:48:46
 */
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, createBezierPoints } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const Cesium = window.Cesium;
const CreateCurve = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  const color = options.color
    ? Cesium.Color.fromCssColorString(options.color)
    : Cesium.Color.BLUE.withAlpha(0.9);
  const onground = options.onground || true;
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = [];
  let polyline: any = undefined;
  let linePoints: any;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键添加点，右键撤销，左键双击结束绘制';
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    if (anchorpoints.length == 0) {
      anchorpoints.push(cartesian);
    }
    anchorpoints.push(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建自由曲线------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (anchorpoints.length > 0) {
      if (!Cesium.defined(polyline)) {
        linePoints = createBezierPoints(anchorpoints);
        polyline = viewer.entities.add({
          name: 'Curve',
          id: id,
          polyline: {
            positions: new Cesium.CallbackProperty(function () {
              return linePoints;
            }, false),
            width: 15,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: color,
            }),
            clampToGround: onground,
          },
        });
        polyline.GeoType = 'Curve'; //记录对象的类型，用户后续编辑等操作
        polyline.Editable = true; //代表当前对象可编辑,false状态下不可编辑
      } else {
        anchorpoints.pop();
        let cartesian = getCatesian3FromPX(viewer, endPos);
        anchorpoints.push(cartesian);
        linePoints = createBezierPoints(anchorpoints);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction((event: any) => {
    anchorpoints.pop();
    anchorpoints.pop(); //因为是双击结束，所以要pop两次，一次是move的结果，一次是单击结果
    polyline.PottingPoint = Cesium.clone(anchorpoints, true); //记录对象的节点数据，用户后续编辑等操作
    polyline.EditingPoint = Cesium.clone(anchorpoints, true); //记录复杂对象的编辑的节点数据，用户后续编辑等操作
    resultList.push(polyline);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (typeof callback == 'function') callback(polyline);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 右键摁下事件
  handler.setInputAction(() => {
    anchorpoints.pop();
  }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
};
export default CreateCurve;