/*
 * 集结地标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-29 16:50:22
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-17 14:55:22
 */
const Cesium = window.Cesium;
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, computeAssemblePoints } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const CreateAssemble = (
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
  let assemblePolygon: any = undefined;
  // 左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击键结束绘制';
    let pos = getCatesian3FromPX(viewer, event.position);
    if (!pos || Cesium.defined(assemblePolygon)) return;
    anchorpoints.push(pos);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      let points = computeAssemblePoints(anchorpoints);
      return new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArrayHeights(points)
      );
    }, false);
    assemblePolygon = viewer.entities.add({
      name: 'AssemblePolygon',
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
    assemblePolygon.GeoType = 'AssemblePolygon'; //记录对象的类型，用户后续编辑等操作
    assemblePolygon.Editable = true; //代表当前对象可编辑,false状态下不可编辑
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建集结地------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    const endCartesian = getCatesian3FromPX(viewer, endPos);
    if (!endCartesian || !Cesium.defined(assemblePolygon)) return;
    if (anchorpoints.length === 2) {
      anchorpoints.pop();
    }
    anchorpoints.push(endCartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键双击事件
  handler.setInputAction(() => {
    assemblePolygon.polygon.hierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArrayHeights(
        computeAssemblePoints(anchorpoints)
      )
    );
    assemblePolygon.PottingPoint = Cesium.clone(anchorpoints, true);
    assemblePolygon.EditingPoint = Cesium.clone(anchorpoints, true);
    resultList.push(assemblePolygon);
    handler.destroy();
    CreateRemindertip(window.toolTip, null, false);
    if (typeof callback == 'function') callback(assemblePolygon);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateAssemble;