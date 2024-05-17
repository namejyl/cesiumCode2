/*
 * 编辑文本方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 14:52:13
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 16:24:42
 */
import { lockingMap } from '../thirdPart/plotCommon';
import { getCatesian3FromPX, transformCartesianToWGS84 } from '../thirdPart/Coordinate';
import { LabelAttributeForm } from '../thirdPart/domUtil';

const Cesium = window.Cesium;
const EditLabel = (
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
  const editItem = collection.find(ele => {
    return ele.id === entity.id;
  });
  let editEntity: any;
  let sourcePos = entity.EditingPoint;
  let updatePos = Cesium.clone(sourcePos.position, true);
  let updateText = Cesium.clone(sourcePos.text, true);
  let updateSize = Cesium.clone(sourcePos.size, true);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.position = new Cesium.CallbackProperty(() => {
      return updatePos;
    }, false);
  } else {
    const newLabel = Cesium.clone(entity.label, false);
    newLabel.fillColor = Cesium.Color.RED.withAlpha(0.4);
    editEntity = viewer.entities.add({
      GeoType: 'EditLabel',
      Editable: true,
      id: 'edit_' + entity.id + new Date().getTime(),
      position: new Cesium.CallbackProperty(() => {
        return updatePos;
      }, false),
      label: newLabel
    });
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'label'
    });
  }
  editEntity.label.text = new Cesium.CallbackProperty(() => {
    return updateText;
  }, false);
  editEntity.label.font = new Cesium.CallbackProperty(() => {
    return updateSize + 'px Helvetica';
  }, false);
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
    //console.log('鼠标移动事件监测：------文本编辑中------');
    const endPos = getCatesian3FromPX(viewer, movement.endPosition);
    if (endPos) updatePos = endPos;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键抬起事件
  handler.setInputAction(() => {
    entity.position = editEntity.position.getValue();
    entity.label.text = editEntity.label.text.getValue();
    entity.label.font = editEntity.label.font.getValue();
    boolDown = false;
    entity.show = true;
    editEntity.show = false;
    lockingMap(viewer, true);
    entity.EditingPoint = {
      position: editEntity.position.getValue(),
      text: editEntity.label.text.getValue(),
      size: editEntity.label.font.getValue().substr(0, editEntity.label.font.getValue().indexOf('px'))
    };
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  // 右键点击事件
  handler.setInputAction((event: any) => {
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (pickEntity.id === editEntity.id) {
        const options = {
          id: pickEntity.id,
          coord: transformCartesianToWGS84(pickEntity.position.getValue()),
          size: pickEntity.label.font.getValue().substr(0, pickEntity.label.font.getValue().indexOf('px')),
          text: pickEntity.label.text.getValue()
        };
        new LabelAttributeForm(viewer, event.position, options);
      }
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};
export default EditLabel;
