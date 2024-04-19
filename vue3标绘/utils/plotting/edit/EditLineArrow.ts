/*
 * 编辑简单箭头方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-30 16:44:19
 */
import { lockingMap, newSessionid } from '../thirdPart/plotCommon';
import { createBezierPoints } from '../thirdPart/plotCommon';
const Cesium = window.Cesium;
const EditLineArrow = (
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
  let linePoints = createBezierPoints(updatePos);
 
  entity.polyline.positions = linePoints;
  entity.show = false;
  let dynamicPos = new Cesium.CallbackProperty(() => {
    return createBezierPoints(updatePos);
  }, false);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.polyline.position = dynamicPos;
    editItem.processEntities = initVertexEntities();
  } else {
    const newPolyline = Cesium.clone(entity.polyline);
    newPolyline.material = Cesium.Color.RED.withAlpha(0.4);
    newPolyline.width = 10;
    newPolyline.positions = dynamicPos;
    editEntity = viewer.entities.add({
      GeoType: 'EditLineArrow',
      Editable: true,
      id: 'edit_' + entity.id,
      polyline: newPolyline,
    });
    const vertexs = initVertexEntities();
 
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'remix_curve',
      processEntities: vertexs,
    });
  }
  let boolDown: boolean = false; //鼠标左键是否处于摁下状态
  let currentPickVertex: any = undefined; //当前选择的要编辑的节点
  let currentPickPolyline: any = undefined; //当前选择的要移动的折线
  handler.setInputAction((event: any) => {
    boolDown = true;
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (!pickEntity.GeoType || !pickEntity.Editable) {
        return;
      }
      if (pickEntity.GeoType === 'LineArrowEditPoints') {
        lockingMap(viewer, false);
        currentPickVertex = pickEntity;
      } else if (pickEntity.GeoType === 'EditLineArrow') {
        lockingMap(viewer, false);
        currentPickPolyline = pickEntity;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((event: any) => {
    //console.log('鼠标移动事件监测：------简单箭头编辑中------');
    if (boolDown && currentPickVertex) {
      let pos = viewer.scene.pickPosition(event.endPosition);
      updatePos[currentPickVertex.description.getValue()] = pos;
    }
    if (boolDown && currentPickPolyline) {
      let startPosition = viewer.scene.pickPosition(event.startPosition);
      let endPosition = viewer.scene.pickPosition(event.endPosition);
      let changed_x = endPosition.x - startPosition.x;
      let changed_y = endPosition.y - startPosition.y;
      let changed_z = endPosition.z - startPosition.z;
      updatePos.forEach((element: any) => {
        element.x = element.x + changed_x;
        element.y = element.y + changed_y;
        element.z = element.z + changed_z;
      });
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 左键抬起事件
  handler.setInputAction(() => {
    entity.polyline.positions = editEntity.polyline.positions.getValue();
    boolDown = false;
    currentPickVertex = undefined;
    currentPickPolyline = undefined;
    lockingMap(viewer, true);
    entity.EditingPoint = Cesium.clone(updatePos, true);
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  // 左键点击事件
  handler.setInputAction((event: any) => {
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      if (pick.id.GeoType === 'LineArrowEditCenterPoints') {
        let index = pick.id.description.getValue() + 1;
        const pos = pick.id.position.getValue();
        updateProcessObj(true, index, pos);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //右键点击事件
  handler.setInputAction((event: any) => {
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      if (pick.id.GeoType === 'LineArrowEditPoints') {
        if (updatePos.length < 3) {
          alert('折线节点数不能少于2个');
          return;
        }
        let index = pick.id.description.getValue();
        updateProcessObj(false, index);
      }
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
 
  function updateProcessObj(add: boolean, index: number, pos?: any) {
    const item = collection.find((ele) => {
      return ele.id === entity.id;
    });
    if (item && item.processEntities) {
      item.processEntities.forEach((entity) => {
        viewer.entities.remove(entity);
      });
      add ? updatePos.splice(index, 0, pos) : updatePos.splice(index, 1);
      item.processEntities = initVertexEntities();
    }
  }
  function initVertexEntities() {
    let vertexPointsEntity: any[] = []; //中途创建的Point对象
    let centerPointsEntity: any[] = []; //中途创建的虚拟Point对象
    for (let index = 0; index < updatePos.length; index++) {
      let point = viewer.entities.add({
        id: 'edit_' + newSessionid(),
        position: new Cesium.CallbackProperty(function () {
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
      point.GeoType = 'LineArrowEditPoints';
      point.Editable = true;
      vertexPointsEntity.push(point);
      if (updatePos[index + 1]) {
        let centerPoint = viewer.entities.add({
          id: 'edit_' + newSessionid(),
          position: new Cesium.CallbackProperty(function () {
            return Cesium.Cartesian3.midpoint(
              updatePos[index],
              updatePos[index + 1],
              new Cesium.Cartesian3()
            );
          }, false),
          point: {
            pixelSize: 15,
            color: Cesium.Color.GREEN.withAlpha(1),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            outlineColor: Cesium.Color.YELLOW.withAlpha(0.6),
          },
          show: true,
          description: index, //记录节点索引
        });
        centerPoint.GeoType = 'LineArrowEditCenterPoints';
        centerPoint.Editable = true;
        centerPointsEntity.push(centerPoint);
      }
    }
    let processEntities = vertexPointsEntity.concat(centerPointsEntity);
    return processEntities;
  }
};
export default EditLineArrow;