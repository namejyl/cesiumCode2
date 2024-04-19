/*
 * 自由多边形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 17:19:25
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-05 17:22:41
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateFreePolygon = (
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
  let anchorpoints: any[] = [];
  let polygon: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击结束绘制';
    if (Cesium.defined(polygon)) {
      return;
    }
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    if (anchorpoints.length == 0) {
      anchorpoints.push(cartesian);
      let dynamicPositions = new Cesium.CallbackProperty(function () {
        return new Cesium.PolygonHierarchy(anchorpoints);
      }, false);
      polygon = viewer.entities.add({
        name: 'FreePolygon',
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
      polygon.GeoType = 'FreePolygon'; //记录对象的类型，用户后续编辑等操作
      polygon.Editable = false; //代表当前对象可编辑,false状态下不可编辑
    }
    anchorpoints.push(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建自由多边形------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (Cesium.defined(polygon)) {
      let cartesian = getCatesian3FromPX(viewer, endPos);
      anchorpoints.push(cartesian);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction((event: any) => {
    const hierarchyPos = new Cesium.PolygonHierarchy(anchorpoints);
    polygon.PottingPoint = Cesium.clone(hierarchyPos, true); //记录对象的节点数据，用户后续编辑等操作
    resultList.push(polygon);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (typeof callback == 'function') callback(polygon);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
export default CreateFreePolygon;