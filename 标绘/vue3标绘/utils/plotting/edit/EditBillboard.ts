/*
 * 编辑广告牌方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 14:52:13
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 16:28:36
 */
import { lockingMap } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
 
const Cesium = window.Cesium;
const EditBillboard = (
  entity: any,
  handler: any,
  collection: {
    id: string;
    source: any;
    target: any;
    geoType: string;
  }[]
) => {
  const viewer = window.Viewer;
  entity.show = false;
  const editItem = collection.find((ele) => {
    return ele.id === entity.id;
  });
  let editEntity: any;
  let sourcePos = entity.EditingPoint;
  let updatePos = Cesium.clone(sourcePos, true);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.position = new Cesium.CallbackProperty(() => {
      return updatePos;
    }, false);
  } else {
    const newBillboard = Cesium.clone(entity.billboard, false);
    newBillboard.scale = 1.2;
    newBillboard.color = Cesium.Color.ORANGE.withAlpha(0.8);
    editEntity = viewer.entities.add({
      GeoType: 'EditBillboard',
      Editable: true,
      id: 'edit_' + entity.id,
      position: new Cesium.CallbackProperty(() => {
        return updatePos;
      }, false),
      billboard: newBillboard,
    });
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'point',
    });
  }
  let boolDown = false;
  // 左键摁下事件
  handler.setInputAction((event: any) => {
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (pickEntity.id === editEntity.id) {
        boolDown = true;
        lockingMap(viewer, false);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((movement: any) => {
    if (!boolDown) return;
    //console.log('鼠标移动事件监测：------广告版编辑中------');
    const endPos = getCatesian3FromPX(viewer, movement.endPosition);
    if (endPos) updatePos = endPos;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键抬起事件
  handler.setInputAction(() => {
    entity.position = editEntity.position.getValue();
    boolDown = false;
    entity.show = true;
    editEntity.show = false;
    lockingMap(viewer, true);
    entity.EditingPoint = updatePos;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
};
export default EditBillboard;