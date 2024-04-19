/*
 * 编辑攻击箭头方法
 * @Author: Wang jianLei
 * @Date: 2023-01-17 22:50:19
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-05 16:33:44
 */
import {
    lockingMap,
    newSessionid,
    getAttackArrowPoints,
  } from '../thirdPart/plotCommon';
  const Cesium = window.Cesium;
  const EditAttackArrow = (
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
    let dynamicHierarchy = new Cesium.CallbackProperty(() => {
      let updatePositions = getAttackArrowPoints(updatePos);
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
        GeoType: 'EditAttackArrow',
        Editable: true,
        id: 'edit_' + entity.id,
        polygon: newPolygon,
      });
      const vertexs = initVertexEntities();
      collection.push({
        id: entity.id,
        source: entity,
        target: editEntity,
        geoType: 'remix_attackarrow',
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
        if (pickEntity.GeoType === 'AttackArrowEditPoints') {
          lockingMap(viewer, false);
          currentPickVertex = pickEntity;
        } else if (pickEntity.GeoType === 'EditAttackArrow') {
          lockingMap(viewer, false);
          currentPickPolygon = pickEntity;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    // 鼠标移动事件
    handler.setInputAction((event: any) => {
      //console.log('鼠标移动事件监测：------攻击箭头编辑中------');
      if (boolDown && currentPickVertex) {
        let pos = viewer.scene.pickPosition(event.endPosition);
        updatePos[currentPickVertex.description.getValue()] = pos;
      }
      if (boolDown && currentPickPolygon) {
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
        if (pick.id.GeoType === 'AttackArrowEditCenterPoints') {
          let index = pick.id.description.getValue();
          const pos = pick.id.position.getValue();
          updateProcessObj(true, index, pos);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击事件
    handler.setInputAction((event: any) => {
      let pick = viewer.scene.pick(event.position);
      if (
        Cesium.defined(pick) &&
        pick.id &&
        pick.id.GeoType === 'AttackArrowEditPoints'
      ) {
        let index = pick.id.description.getValue();
        if (index < 2) {
          alert('攻击箭头的箭尾节点不支持删除');
          return;
        }
        if (updatePos.length < 4) {
          alert('攻击箭头节点数不能少于3个');
          return;
        }
        updateProcessObj(false, index);
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
        point.GeoType = 'AttackArrowEditPoints';
        point.Editable = true;
        vertexPointsEntity.push(point);
        if (index > 1) {
          let centerPoint = viewer.entities.add({
            id: 'edit_' + newSessionid(),
            position: new Cesium.CallbackProperty(() => {
              let startPos =
                index === 2
                  ? Cesium.Cartesian3.midpoint(
                      updatePos[0],
                      updatePos[1],
                      new Cesium.Cartesian3()
                    )
                  : updatePos[index - 1];
              return Cesium.Cartesian3.midpoint(
                startPos,
                updatePos[index],
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
          centerPoint.GeoType = 'AttackArrowEditCenterPoints';
          centerPoint.Editable = true;
          centerPointsEntity.push(centerPoint);
        }
      }
      let processEntities = vertexPointsEntity.concat(centerPointsEntity);
      return processEntities;
    }
  };
  export default EditAttackArrow;