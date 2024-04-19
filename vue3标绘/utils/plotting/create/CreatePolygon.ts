/*
 * 多边形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 17:20:06
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-05 17:21:16
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreatePolygon = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  let color = options.color
    ? Cesium.Color.fromCssColorString(options.color)
    : Cesium.Color.BLUE.withAlpha(0.4);
  const onground = options.onground || true;
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = [];
  let polygon: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    if (anchorpoints.length == 0) {
      window.toolTip = '左键添加第二个顶点';
      anchorpoints.push(cartesian);
      let dynamicPositions = new Cesium.CallbackProperty(function () {
        return new Cesium.PolygonHierarchy(anchorpoints);
      }, false);
      polygon = viewer.entities.add({
        name: 'Polygon',
        id: id,
        polygon: {
          hierarchy: dynamicPositions,
          material: color,
          heightReference: onground
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
        },
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            const linePos = anchorpoints.concat(anchorpoints[0]);
            return linePos;
          }, false),
          width: 5,
          material: Cesium.Color.GREEN,
          clampToGround: onground,
        },
      });
      polygon.GeoType = 'Polygon'; //记录对象的类型，用户后续编辑等操作
      polygon.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    } else {
      window.toolTip = '左键添加点，右键撤销，左键双击完成绘制';
    }
    anchorpoints.push(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建多边形------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (Cesium.defined(polygon)) {
      anchorpoints.pop();
      let cartesian = getCatesian3FromPX(viewer, endPos);
      if (!cartesian) {
        return;
      }
      anchorpoints.push(cartesian);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction((event: any) => {
    anchorpoints.pop();
    anchorpoints.pop(); //因为是双击结束，所以要pop两次，一次是move的结果，一次是单击结果
    polygon.PottingPoint = Cesium.clone(anchorpoints, true); //记录对象的节点数据，用户后续编辑等操作
    resultList.push(polygon);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (typeof callback == 'function') callback(polygon);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 右键摁下事件
  handler.setInputAction(() => {
    anchorpoints.pop();
  }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
};
export default CreatePolygon;