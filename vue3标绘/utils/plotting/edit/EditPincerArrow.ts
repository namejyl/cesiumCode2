/*
 * 编辑钳击箭头方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-17 17:47:54
 */
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
import {
  lockingMap,
  newSessionid,
  calculatePincerArrowPoint,
} from '../thirdPart/plotCommon';
const Cesium = window.Cesium;
const EditPincerArrow = (
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
 
  entity.show = false;
  let dynamicPositions = new Cesium.CallbackProperty(function () {
    let points = calculatePincerArrowPoint(updatePos);
    return new Cesium.PolygonHierarchy(points);
  }, false);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.polygon.hierarchy = dynamicPositions;
    editItem.processEntities = initVertexEntities();
  } else {
    const newPincerArrow = Cesium.clone(entity.polygon);
    newPincerArrow.material = Cesium.Color.RED.withAlpha(0.4);
    newPincerArrow.hierarchy = dynamicPositions;
    editEntity = viewer.entities.add({
      GeoType: 'EditPincerArrow',
      Editable: true,
      id: 'edit_' + entity.id,
      polygon: newPincerArrow,
    });
    const vertexs = initVertexEntities();
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'remix_pincerarrow',
      processEntities: vertexs,
    });
  }
  let boolDown: boolean = false; //鼠标左键是否处于摁下状态
  let currentPickVertex: any = undefined; //当前选择的要编辑的节点
  let currentPickPolygon: any = undefined; //当前选择的要移动的钳击箭头
  // 左键摁下事件
  handler.setInputAction((event: any) => {
    boolDown = true;
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (!pickEntity.GeoType || !pickEntity.Editable) {
        return;
      }
      if (pickEntity.GeoType === 'PincerArrowEditPoint') {
        lockingMap(viewer, false);
        currentPickVertex = pickEntity;
      } else if (pickEntity.GeoType === 'EditPincerArrow') {
        lockingMap(viewer, false);
        currentPickPolygon = pickEntity;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((event: any) => {
    //console.log('鼠标移动事件监测：------钳击箭头编辑中------');
    if (boolDown && currentPickVertex) {
      let pos = getCatesian3FromPX(viewer, event.endPosition);
      if (pos) {
        updatePos[currentPickVertex.description] = pos;
      }
    }
    if (boolDown && currentPickPolygon) {
      let startPosition = viewer.scene.pickPosition(event.startPosition);
      let endPosition = viewer.scene.pickPosition(event.endPosition);
      let changed_x = endPosition.x - startPosition.x;
      let changed_y = endPosition.y - startPosition.y;
      let changed_z = endPosition.z - startPosition.z;
      for (let index = 0; index < updatePos.length; index++) {
        updatePos[index] = new Cesium.Cartesian3(
          updatePos[index].x + changed_x,
          updatePos[index].y + changed_y,
          updatePos[index].z + changed_z
        );
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键抬起事件
  handler.setInputAction(() => {
    entity.polygon.hierarchy = editEntity.polygon.hierarchy;
    boolDown = false;
    currentPickVertex = undefined;
    currentPickPolygon = undefined;
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
      verEntity.GeoType = 'PincerArrowEditPoint';
      verEntity.Editable = true;
      processEntities.push(verEntity);
    }
    return processEntities;
  }
};
export default EditPincerArrow;