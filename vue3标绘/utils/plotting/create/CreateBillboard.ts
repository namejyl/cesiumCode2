/*
 * 广告牌标绘功能
 * @Author: Wang jianLei
 * @Date: 2023-01-13 17:44:23
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 16:26:46
 */
import CreateRemindertip from '../thirdPart/ReminderTip';
import { newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
// import imageIcon from './data/billboard.png';
const Cesium = window.Cesium;
const CreateBillboard = (
  viewer: any,
  handler: any,
  resultList: any[],
  options: any,
  callback?: Function
) => {
  const id = options.id || newSessionid();
  const onground = options.onground || true;
  const image = options.image //|| imageIcon;
  if (viewer.entities.getById(id))
    throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击选择点位';
  handler.setInputAction((event: any) => {
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    const billboard = viewer.entities.add({
      id: id,
      name: 'Billboard',
      position: cartesian,
      billboard: {
        image: image,
        scale: 1,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scaleByDistance: new Cesium.NearFarScalar(1.5e1, 1.5, 1.5e5, 0.4),
        heightReference: onground
          ? Cesium.HeightReference.CLAMP_TO_GROUND
          : Cesium.HeightReference.NONE,
        disableDepthTestDistance: 15000, //解决遮挡显示一半的问题
      },
    });
    billboard.GeoType = 'Billboard'; //记录对象的类型，用户后续编辑等操作
    billboard.PottingPoint = cartesian; //记录对象的节点数据，用户后续编辑等操作
    billboard.EditingPoint = cartesian; //记录对象的节点数据，用户后续编辑等操作
    billboard.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    resultList.push(billboard);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (callback && typeof callback == 'function') callback(billboard);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建点------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};
export default CreateBillboard;