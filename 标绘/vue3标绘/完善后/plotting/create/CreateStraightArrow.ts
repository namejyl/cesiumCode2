/*
 * 创建直线箭头
 * @Author: Wang jianLei
 * @Date: 2022-04-15 14:21:28
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-19 17:50:00
 */
 
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid, calculateSwallowPoints } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const Cesium = window.Cesium;
const CreateStraightArrow = (
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
  let straightArrow: any = undefined;
  window.toolTip = '左键点击开始绘制';
  //左键点击事件
  handler.setInputAction((event: any) => {
    window.toolTip = '左键双击结束绘制';
    let cartesian = getCatesian3FromPX(viewer, event.position);
    if (!cartesian || Cesium.defined(straightArrow)) return;
    anchorpoints.push(cartesian);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      let points = calculateSwallowPoints(anchorpoints, 3);
      return new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArrayHeights(points)
      );
    }, false);
    straightArrow = viewer.entities.add({
      id: id,
      name: 'StraightArrow',
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
    straightArrow.GeoType = 'StraightArrow'; //记录对象的类型，用户后续编辑等操作
    straightArrow.Editable = true; //代表当前对象可编辑,false状态下不可编辑
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //鼠标移动事件
  handler.setInputAction((move: any) => {
    //console.log('鼠标移动事件监测：------创建直线箭头------');
    let endPos = move.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
    let cartesian = getCatesian3FromPX(viewer, endPos);
    if (!cartesian || !Cesium.defined(straightArrow)) return;
    if (anchorpoints.length === 2) {
      anchorpoints.pop();
    }
    anchorpoints.push(cartesian);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //左键双击事件
  handler.setInputAction((event: any) => {
    straightArrow.PottingPoint = Cesium.clone(anchorpoints, true); //记录对象的节点数据，用户后续编辑等操作
    straightArrow.EditingPoint = Cesium.clone(anchorpoints, true); //记录复杂对象的编辑的节点数据，用户后续编辑等操作
    let points = calculateSwallowPoints(anchorpoints, 3);
    straightArrow.polygon.hierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArrayHeights(points)
    );
    resultList.push(straightArrow);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (typeof callback == 'function') callback(straightArrow);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};
 
export default CreateStraightArrow;