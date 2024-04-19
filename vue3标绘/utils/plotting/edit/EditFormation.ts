/*
 * 编辑防御、进攻阵型方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-18 17:11:38
 */
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
import {
  lockingMap,
  newSessionid,
  calculateFormationPoints,
} from '../thirdPart/plotCommon';
const Cesium = window.Cesium;
const EditFormation = (
  entity: any,
  handler: any,
  collection: {
    id: string;
    source: any;
    target: any;
    geoType: string;
    processEntities?: any[];
  }[]
) => {
  const viewer = window.Viewer;
  let editItem = collection.find((ele) => {
    return ele.id === entity.id;
  });
  let editEntity: any;
  let sourcePos = entity.EditingPoint;
  let updatePos = Cesium.clone(sourcePos, true);
  let type = entity.GeoNum;
  entity.show = false;
  let dynamicPositions = new Cesium.CallbackProperty(function () {
    return calculateFormationPoints(updatePos, type);
  }, false);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.polyline.positions = dynamicPositions;
    editItem.processEntities = initVertexEntities();
  } else {
    const newFormation = Cesium.clone(entity.polyline);
    newFormation.material = Cesium.Color.RED.withAlpha(0.4);
    newFormation.positions = dynamicPositions;
    editEntity = viewer.entities.add({
      GeoType: 'EditFormation',
      Editable: true,
      id: 'edit_' + entity.id,
      polyline: newFormation,
    });
    const vertexs = initVertexEntities();
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'remix_formation',
      processEntities: vertexs,
    });
  }
  let boolDown: boolean = false; //鼠标左键是否处于摁下状态
  let currentPickVertex: any = undefined; //当前选择的要编辑的节点
  let currentPickFormation: any = undefined; //当前选择的要移动的阵型对象
  // 左键摁下事件
  handler.setInputAction((event: any) => {
    boolDown = true;
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (!pickEntity.GeoType || !pickEntity.Editable) {
        return;
      }
      if (pickEntity.GeoType === 'FormationEditPoint') {
        lockingMap(viewer, false);
        currentPickVertex = pickEntity;
      } else if (pickEntity.GeoType === 'EditFormation') {
        lockingMap(viewer, false);
        currentPickFormation = pickEntity;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((event: any) => {
    //console.log('鼠标移动事件监测：------阵型编辑中------');
    if (boolDown && currentPickVertex) {
      let pos = getCatesian3FromPX(viewer, event.endPosition);
      if (pos) {
        updatePos[currentPickVertex.description] = pos;
      }
    }
    if (boolDown && currentPickFormation) {
      let startPosition = viewer.scene.pickPosition(event.startPosition);
      let endPosition = viewer.scene.pickPosition(event.endPosition);
      let changed_x = endPosition.x - startPosition.x;
      let changed_y = endPosition.y - startPosition.y;
      let changed_z = endPosition.z - startPosition.z;
      updatePos[0] = new Cesium.Cartesian3(
        updatePos[0].x + changed_x,
        updatePos[0].y + changed_y,
        updatePos[0].z + changed_z
      );
      updatePos[1] = new Cesium.Cartesian3(
        updatePos[1].x + changed_x,
        updatePos[1].y + changed_y,
        updatePos[1].z + changed_z
      );
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键抬起事件
  handler.setInputAction(() => {
    entity.polyline.positions = editEntity.polyline.positions;
    boolDown = false;
    currentPickVertex = undefined;
    currentPickFormation = undefined;
    lockingMap(viewer, true);
    entity.EditingPoint = updatePos;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
 
  function initVertexEntities() {
    let processEntities: any[] = [];
 
    for (let index = 0; index < updatePos.length; index++) {
      let verEntity = viewer.entities.add({
        id: 'edit_' + newSessionid(),
        position: new Cesium.CallbackProperty(() => {
          return updatePos[index];
        }, false),
        point: {
          pixelSize: 20,
          color: Cesium.Color.YELLOW.withAlpha(0.6),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          outlineColor: Cesium.Color.DARKRED.withAlpha(1),
        },
        show: true,
        description: index, //记录节点索引
      });
      verEntity.GeoType = 'FormationEditPoint';
      verEntity.Editable = true;
      processEntities.push(verEntity);
    }
    return processEntities;
  }
};
export default EditFormation;