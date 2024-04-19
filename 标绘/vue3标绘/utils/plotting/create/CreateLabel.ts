/*
 * 文本标注功能
 * @Author: Wang jianLei
 * @Date: 2023-01-13 17:44:23
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-22 17:54:29
 */
import CreateRemindertip from '../thirdPart/ReminderTip';
import { getLabelText, newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const Cesium = window.Cesium;
const CreateLabel = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  const onground = options.onground || true;
  const color = options.color
    ? Cesium.Color.fromCssColorString(options.color)
    : Cesium.Color.WHITE;
  const text = getLabelText(options.text || 'undefined', 0);
  const size = options.size || '32';
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击选择点位';
  handler.setInputAction((event: any) => {
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    const point = viewer.entities.add({
      id: id,
      name: 'Label',
      position: cartesian,
      label: {
        text: text,
        font: size + 'px Helvetica',
        fillColor: color,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: onground
          ? Cesium.HeightReference.CLAMP_TO_GROUND
          : Cesium.HeightReference.NONE,
        disableDepthTestDistance: 100000, //解决遮挡显示一半的问题
      },
    });
    point.GeoType = 'Label'; //记录对象的类型，用户后续编辑等操作
    point.PottingPoint = {
      position: cartesian,
      text: text,
      size: size,
    }; //记录对象的节点数据，用户后续编辑等操作
    point.EditingPoint = {
      position: cartesian,
      text: text,
      size: size,
    }; //记录对象的节点数据，用户后续编辑等操作
    point.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    resultList.push(point);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (callback && typeof callback == 'function') callback(point);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建文本------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};
 
export default CreateLabel;