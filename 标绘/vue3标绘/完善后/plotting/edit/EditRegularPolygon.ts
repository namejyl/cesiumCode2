/*
 * 编辑正多边形方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2023-01-17 23:07:41
 */
import { getCatesian3FromPX } from "../thirdPart/Coordinate";
import {
  lockingMap,
  newSessionid,
  getRegularPoints,
} from "../thirdPart/plotCommon";
const Cesium = window.Cesium;
const EditRegularPolygon = (
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
  let updatePositions = getRegularPoints(
    updatePos.center,
    updatePos.end,
    updatePos.num
  );
  entity.show = false;
  let dynamicHierarchy = new Cesium.CallbackProperty(() => {
    return new Cesium.PolygonHierarchy(updatePositions);
  }, false);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.polygon.hierarchy = dynamicHierarchy;
    editItem.processEntities = initVertexEntities();
  } else {
    const newPolygon = Cesium.clone(entity.polygon);
    newPolygon.material = Cesium.Color.RED.withAlpha(0.4);
    newPolygon.hierarchy = dynamicHierarchy;
    editEntity = viewer.entities.add({
      GeoType: "EditRegularPolygon",
      Editable: true,
      id: "edit_" + entity.id,
      polygon: newPolygon,
    });
    const vertexs = initVertexEntities();
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: "remix_regularpolygon",
      processEntities: vertexs,
    });
  }
  let boolDown: boolean = false; //鼠标左键是否处于摁下状态
  let currentPickVertex: any = undefined; //当前选择的要编辑的节点
  let currentPickPolygon: any = undefined; //当前选择的要移动的多边形
  // 左键摁下事件
  handler.setInputAction((event: any) => {
    boolDown = true;
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (!pickEntity.GeoType || !pickEntity.Editable) {
        return;
      }
      if (pickEntity.GeoType === "RegularPolygonEditEnd") {
        lockingMap(viewer, false);
        currentPickVertex = pickEntity;
      } else if (
        pickEntity.GeoType === "EditRegularPolygon" ||
        pickEntity.GeoType === "RegularPolygonEditCenter"
      ) {
        lockingMap(viewer, false);
        currentPickPolygon = pickEntity;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((event: any) => {
    //console.log("鼠标移动事件监测：------正多边形编辑中------");
    if (boolDown && currentPickVertex) {
      let pos = getCatesian3FromPX(viewer, event.endPosition);
      updatePos.end = pos;
      updatePositions = getRegularPoints(updatePos.center, pos, updatePos.num);
    }
    if (boolDown && currentPickPolygon) {
      let startPosition = viewer.scene.pickPosition(event.startPosition);
      let endPosition = viewer.scene.pickPosition(event.endPosition);
      let changed_x = endPosition.x - startPosition.x;
      let changed_y = endPosition.y - startPosition.y;
      let changed_z = endPosition.z - startPosition.z;
      updatePos.center = new Cesium.Cartesian3(
        updatePos.center.x + changed_x,
        updatePos.center.y + changed_y,
        updatePos.center.z + changed_z
      );
      updatePos.end = new Cesium.Cartesian3(
        updatePos.end.x + changed_x,
        updatePos.end.y + changed_y,
        updatePos.end.z + changed_z
      );
      updatePositions.forEach((element: any) => {
        element.x = element.x + changed_x;
        element.y = element.y + changed_y;
        element.z = element.z + changed_z;
      });
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
  // 左键点击事件
  handler.setInputAction((event: any) => {
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      if (pick.id.GeoType === "RegularPolygonEditCenter") {
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
      if (pick.id.GeoType === "RegularPolygonEditCenter") {
        if (updatePositions.length < 4) {
          alert("多边形节点数不能少于3个");
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
      add
        ? updatePositions.splice(index, 0, pos)
        : updatePositions.splice(index, 1);
      item.processEntities = initVertexEntities();
    }
  }
  function initVertexEntities() {
    let centerEntity = viewer.entities.add({
      id: "edit_" + newSessionid(),
      position: new Cesium.CallbackProperty(() => {
        return updatePos.center;
      }, false),
      point: {
        pixelSize: 20,
        color: Cesium.Color.YELLOW.withAlpha(0.6),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineColor: Cesium.Color.DARKRED.withAlpha(1),
      },
      show: true,
    });
    centerEntity.GeoType = "RegularPolygonEditCenter";
    centerEntity.Editable = true;
    let endEntity = viewer.entities.add({
      id: "edit_" + newSessionid(),
      position: new Cesium.CallbackProperty(() => {
        return updatePos.end;
      }, false),
      point: {
        pixelSize: 20,
        color: Cesium.Color.GREEN.withAlpha(1),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineColor: Cesium.Color.YELLOW.withAlpha(0.6),
      },
      show: true,
    });
 
    endEntity.GeoType = "RegularPolygonEditEnd";
    endEntity.Editable = true;
    let processEntities = [centerEntity, endEntity];
    return processEntities;
  }
};
export default EditRegularPolygon;