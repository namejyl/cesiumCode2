
/*
 * 正多边形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-05 17:24:44
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, getRegularPoints } from '../thirdPart/plotCommon';
import {
  getCatesian3FromPX,
  transformCartesianToWGS84,
} from '../thirdPart/Coordinate';
 
const CreateRegularPolygon = (
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
  let num = options.num && options.num > 2 ? options.num : 5; //默认绘制正五边形
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击开始绘制';
  let anchorpoints: any[] = [];
  let regularPolygon: any = undefined;
  let centerPoint: any, centerP: any;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    if (Cesium.defined(regularPolygon)) {
      return;
    }
    centerPoint = getCatesian3FromPX(viewer, event.position);
    centerP = transformCartesianToWGS84(centerPoint);
    let pointlist = getRegularPoints(centerPoint, undefined, num);
    anchorpoints = pointlist;
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return new Cesium.PolygonHierarchy(anchorpoints);
    }, false);
    regularPolygon = viewer.entities.add({
      name: 'RegularPolygon',
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
    regularPolygon.GeoType = 'RegularPolygon'; //记录对象的类型，用户后续编辑等操作
    regularPolygon.Editable = true; //代表当前对象可编辑,false状态下不可编辑
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建正多边形------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (Cesium.defined(regularPolygon)) {
      const endCartesian = getCatesian3FromPX(viewer, endPos);
      anchorpoints = getRegularPoints(centerPoint, endCartesian, num);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction((event: any) => {
    const endPosition = getCatesian3FromPX(viewer, event.position);
    anchorpoints = getRegularPoints(centerPoint, endPosition, num);
    regularPolygon.PottingPoint = {
      center: centerPoint,
      end: endPosition,
      num: num,
    };
    regularPolygon.EditingPoint = {
      center: centerPoint,
      end: endPosition,
      num: num,
    };
    resultList.push(regularPolygon);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(regularPolygon);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateRegularPolygon;