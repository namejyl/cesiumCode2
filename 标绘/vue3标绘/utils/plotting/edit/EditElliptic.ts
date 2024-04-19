/*
 * 编辑椭圆方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2023-01-17 23:07:41
 */
import { getCatesian3FromPX } from '../thirdPart/Coordinate';
import {
  lockingMap,
  newSessionid,
  getSemiAxis,
  getEllipticAngle,
} from '../thirdPart/plotCommon';
const Cesium = window.Cesium;
const EditElliptic = (
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
  let dynamicPos = new Cesium.CallbackProperty(() => {
    return updatePos[0];
  }, false);
  let semiMinorAxis = new Cesium.CallbackProperty(function () {
    return getSemiAxis(updatePos) / 2;
  }, false);
  let semiMajorAxis = new Cesium.CallbackProperty(function () {
    return getSemiAxis(updatePos);
  }, false);
  let rotation = new Cesium.CallbackProperty(function () {
    return getEllipticAngle(updatePos);
  }, false);
  if (editItem) {
    editEntity = editItem.target;
    editEntity.show = true;
    editEntity.position = dynamicPos;
    editEntity.ellipse.semiMinorAxis = semiMinorAxis;
    editEntity.ellipse.semiMajorAxis = semiMajorAxis;
    editEntity.ellipse.rotation = rotation;
    editItem.processEntities = initVertexEntities();
  } else {
    const newElliptic = Cesium.clone(entity.ellipse);
    newElliptic.material = Cesium.Color.RED.withAlpha(0.4);
    newElliptic.semiMinorAxis = semiMinorAxis;
    newElliptic.semiMajorAxis = semiMajorAxis;
    newElliptic.rotation = rotation;
    editEntity = viewer.entities.add({
      position: dynamicPos,
      GeoType: 'EditElliptic',
      Editable: true,
      id: 'edit_' + entity.id,
      ellipse: newElliptic,
    });
    const vertexs = initVertexEntities();
    collection.push({
      id: entity.id,
      source: entity,
      target: editEntity,
      geoType: 'remix_elliptic',
      processEntities: vertexs,
    });
  }
  let boolDown: boolean = false; //鼠标左键是否处于摁下状态
  let currentPickVertex: any = undefined; //当前选择的要编辑的节点
  let currentPickPolygon: any = undefined; //当前选择的要移动的椭圆
  // 左键摁下事件
  handler.setInputAction((event: any) => {
    boolDown = true;
    let pick = viewer.scene.pick(event.position);
    if (Cesium.defined(pick) && pick.id) {
      const pickEntity = pick.id;
      if (!pickEntity.GeoType || !pickEntity.Editable) {
        return;
      }
      if (pickEntity.GeoType === 'EllipticEditEnd') {
        lockingMap(viewer, false);
        currentPickVertex = pickEntity;
      } else if (
        pickEntity.GeoType === 'EditElliptic' ||
        pickEntity.GeoType === 'EllipticEditCenter'
      ) {
        lockingMap(viewer, false);
        currentPickPolygon = pickEntity;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((event: any) => {
    //console.log('鼠标移动事件监测：------正多边形编辑中------');
    if (boolDown && currentPickVertex) {
      let pos = getCatesian3FromPX(viewer, event.endPosition);
      updatePos[1] = pos;
    }
    if (boolDown && currentPickPolygon) {
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
    entity.position = editEntity.position;
    entity.ellipse.semiMinorAxis = editEntity.ellipse.semiMinorAxis;
    entity.ellipse.semiMajorAxis = editEntity.ellipse.semiMajorAxis;
    entity.ellipse.rotation = editEntity.ellipse.rotation;
    boolDown = false;
    currentPickVertex = undefined;
    currentPickPolygon = undefined;
    lockingMap(viewer, true);
    entity.EditingPoint = updatePos;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
 
  function initVertexEntities() {
    let centerEntity = viewer.entities.add({
      id: 'edit_' + newSessionid(),
      position: new Cesium.CallbackProperty(() => {
        return updatePos[0];
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
    centerEntity.GeoType = 'EllipticEditCenter';
    centerEntity.Editable = true;
    let endEntity = viewer.entities.add({
      id: 'edit_' + newSessionid(),
      position: new Cesium.CallbackProperty(() => {
        return updatePos[1];
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
 
    endEntity.GeoType = 'EllipticEditEnd';
    endEntity.Editable = true;
    let processEntities = [centerEntity, endEntity];
    return processEntities;
  }
};
export default EditElliptic;