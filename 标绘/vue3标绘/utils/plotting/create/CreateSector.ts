/*
 * 扇形标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-19 17:40:48
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, calculateSectorPoints } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateSector = (
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
  let sector: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    let pos = getCatesian3FromPX(viewer, event.position);
    if (!pos || anchorpoints.length > 2) return;
    anchorpoints.push(pos);
    if (!Cesium.defined(sector)) {
      let dynamicPositions = new Cesium.CallbackProperty(function () {
        return new Cesium.PolygonHierarchy(calculateSectorPoints(anchorpoints));
      }, false);
      sector = viewer.entities.add({
        name: 'Sector',
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
      sector.GeoType = 'Sector'; //记录对象的类型，用户后续编辑等操作
      sector.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建扇形------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    if (!Cesium.defined(sector) || anchorpoints.length < 2) return;
    const endCartesian = getCatesian3FromPX(viewer, endPos);
    if (!endCartesian) return;
    if (anchorpoints.length === 3) {
      anchorpoints.pop();
    }
    anchorpoints.push(endCartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    sector.polygon.hierarchy = new Cesium.PolygonHierarchy(
      calculateSectorPoints(anchorpoints)
    );
    sector.PottingPoint = Cesium.clone(anchorpoints, true);
    sector.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(sector);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(sector);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateSector;