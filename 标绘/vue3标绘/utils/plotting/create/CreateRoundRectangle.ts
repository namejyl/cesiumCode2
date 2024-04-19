/*
 * 圆角矩形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-19 08:48:36
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import {
  newSessionid,
  computeRoundedRectanglePoints,
} from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateRoundRectangle = (
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
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = []; //记录圆角矩形的左上和右下两个点
  let roundRectangle: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    let pos = getCatesian3FromPX(viewer, event.position);
    if (!pos || Cesium.defined(roundRectangle)) return;
    anchorpoints.push(pos);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return new Cesium.PolygonHierarchy(
        computeRoundedRectanglePoints(anchorpoints)
      );
    }, false);
    roundRectangle = viewer.entities.add({
      name: 'RoundRectangle',
      id: id,
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
    roundRectangle.GeoType = 'RoundRectangle'; //记录对象的类型，用户后续编辑等操作
    roundRectangle.Editable = true; //代表当前对象可编辑,false状态下不可编辑
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建圆角矩形------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (!Cesium.defined(roundRectangle)) return;
    const endCartesian = getCatesian3FromPX(viewer, endPos);
    if (!endCartesian) return;
    if (anchorpoints.length > 1) {
      anchorpoints.pop();
    }
    anchorpoints.push(endCartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    roundRectangle.polygon.hierarchy = new Cesium.PolygonHierarchy(
      computeRoundedRectanglePoints(anchorpoints)
    );
    roundRectangle.PottingPoint = Cesium.clone(anchorpoints, true);
    roundRectangle.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(roundRectangle);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(roundRectangle);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateRoundRectangle;