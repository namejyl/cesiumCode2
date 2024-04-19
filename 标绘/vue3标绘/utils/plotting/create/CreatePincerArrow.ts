/*
 * 创建钳击箭头
 * @Author: Wang jianLei
 * @Date: 2022-04-15 14:21:28
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-17 17:32:35
 */
 
import CreateRemindertip from '../thirdPart/ReminderTip';
import {
  newSessionid,
  calculatePincerArrowPoint,
} from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
const Cesium = window.Cesium;
const CreatePincerArrow = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  let color = options.color
    ? Cesium.Color.fromCssColorString(options.color)
    : Cesium.Color.RED;
  const onground = options.onground || true;
  let anchorpoints: any[] = [];
  let pincerArrow: any = undefined;
  window.toolTip = '左键点击开始绘制';
  //左键点击事件
  handler.setInputAction((event: any) => {
    let cartesian = getCatesian3FromPX(viewer, event.position);
    if (!cartesian || anchorpoints.length > 4) return;
    anchorpoints.push(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //鼠标移动事件
  handler.setInputAction((move: any) => {
    //console.log('鼠标移动事件监测：------创建钳击箭头------');
    let endPos = move.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    let cartesian = getCatesian3FromPX(viewer, endPos);
    if (!cartesian || anchorpoints.length === 0) return;
    window.toolTip =
      anchorpoints.length === 5
        ? '右键撤销，左键双击结束绘制'
        : '左键添加点，右键撤销';
    if (anchorpoints.length >= 2) {
      if (!Cesium.defined(pincerArrow)) {
        anchorpoints.push(cartesian);
        let dynamicPositions = new Cesium.CallbackProperty(function () {
          let points = calculatePincerArrowPoint(anchorpoints);
          return new Cesium.PolygonHierarchy(points);
        }, false);
        pincerArrow = viewer.entities.add({
          id: id,
          name: 'PincerArrow',
          polygon: new Cesium.PolygonGraphics({
            hierarchy: dynamicPositions,
            show: true,
            fill: true,
            material: color,
            heightReference: onground
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          }),
        });
        pincerArrow.GeoType = 'PincerArrow'; //记录对象的类型，用户后续编辑等操作
        pincerArrow.Editable = true; //代表当前对象可编辑,false状态下不可编辑
      } else {
        anchorpoints.pop();
        anchorpoints.push(cartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //左键双击事件
  handler.setInputAction((event: any) => {
    pincerArrow.PottingPoint = Cesium.clone(anchorpoints, true); //记录对象的节点数据，用户后续编辑等操作
    pincerArrow.EditingPoint = Cesium.clone(anchorpoints, true); //记录复杂对象的编辑的节点数据，用户后续编辑等操作
    let points = calculatePincerArrowPoint(anchorpoints);
    pincerArrow.polygon.hierarchy = new Cesium.PolygonHierarchy(points);
    resultList.push(pincerArrow);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (typeof callback == 'function') callback(pincerArrow);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 右键摁下事件
  handler.setInputAction(() => {
    anchorpoints.pop();
  }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
};
 
export default CreatePincerArrow;