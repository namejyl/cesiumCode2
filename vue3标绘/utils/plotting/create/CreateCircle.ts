/*
 * 圆形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-16 11:49:37
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { getEllipticAngle, newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateCircle = (
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
  let anchorpoints: any[] = []; //两个点，一个中心点，一个端点
  let circle: any = undefined;
  let radius = new Cesium.CallbackProperty(function () {
    return getSemiAxis(anchorpoints);
  }, false);
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    let pos = getCatesian3FromPX(viewer, event.position);
    if (!pos) return;
    if (anchorpoints.length === 0) {
      anchorpoints.push(pos);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (anchorpoints.length === 0) return;
    //console.log('鼠标移动事件监测：------创建圆形------');
    const endCartesian = getCatesian3FromPX(viewer, endPos);
 
    if (Cesium.defined(circle)) {
      anchorpoints.pop();
      anchorpoints.push(endCartesian);
    } else {
      anchorpoints.push(endCartesian);
      circle = viewer.entities.add({
        id: id,
        position: anchorpoints[0],
        name: 'Circle',
        ellipse: {
          semiMinorAxis: radius,
          semiMajorAxis: radius,
          material: color,
          heightReference: onground
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
        },
      });
      circle.GeoType = 'Circle'; //记录对象的类型，用户后续编辑等操作
      circle.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    circle.PottingPoint = Cesium.clone(anchorpoints, true);
    circle.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(circle);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(circle);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
function getSemiAxis(points: any[]) {
  return points.length === 2
    ? Cesium.Cartesian3.distance(points[0], points[1])
    : 0;
}
 
export default CreateCircle;