/*
 * 态势标绘编辑主类
 * @Author: Wang jianLei
 * @Date: 2023-01-16 15:01:03
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2023-01-29 16:51:12
 */
import { showToolTip, removeToolTip } from "../thirdPart/Tooltip";
import { createBezierPoints, getRegularPoints } from "../thirdPart/plotCommon";
import EditAssemble from "./EditAssemble";
import EditAttackArrow from "./EditAttackArrow";
import EditBillboard from "./EditBillboard";
import EditBow from "./EditBow";
import EditCircle from "./EditCircle";
import EditCurve from "./EditCurve";
import EditElliptic from "./EditElliptic";
import EditFlag from "./EditFlag";
import EditFormation from "./EditFormation";
// import EditFreeLine from "./EditFreeLine";
// import EditFreePolygon from "./EditFreePolygon";
import EditLabel from "./EditLabel";
import EditLineArrow from "./EditLineArrow";
import EditPincerArrow from "./EditPincerArrow";
import EditPoint from "./EditPoint";
import EditPolygon from "./EditPolygon";
import EditPolyline from "./EditPolyline";
import EditRectangle from "./EditRectangle";
import EditRegularPolygon from "./EditRegularPolygon";
import EditRightAngleArrow from "./EditRightAngleArrow";
import EditRoundRectangle from "./EditRoundRectangle";
import EditSector from "./EditSector";
import EditStraightArrow from "./EditStraightArrow";
import EditSwallowtailArrow from "./EditSwallowtailArrow";
const Cesium = window.Cesium;
interface StorageEntity {
  id: string; //源对象id
  source: any; //记录源对象
  target: any; //记录编辑后对象
  geoType: string; //集合基本类型，普通图形无非就是点\线\面三类 - point,polyline,polygon，对于钳击箭头，曲线等复杂图形 - remix
  processEntities?: any[]; //过程对象
}
class ObjectEdit {
  _viewer: any;
  _moveHandler: any;
  _editHandler: any;
  _toolTip: string;
  _enable: boolean;
  _editCollection: StorageEntity[];
  _preEntity: any;
  constructor(viewer: any) {
    if (!viewer) throw new Error("no viewer object!");
    this._viewer = viewer;
    this._toolTip = "";
    this._enable = false;
    this._editCollection = [];
    this._preEntity = undefined;
  }
  /**
   * 获取编辑状态
   */
  get enable(): boolean {
    return this._enable;
  }
  /**
   * 修改编辑状态
   */
  set enable(v: boolean) {
    v ? this.initStatus() : this.destroy();
    this._enable = v;
  }
  /**
   * 初始化编辑状态
   */
  initStatus() {
    const $this = this;
    const viewer = this._viewer;
    this._moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    this._moveHandler.setInputAction(function (movement: any) {
      console.log("鼠标移动事件监测：------编辑点选前------");
      const endPos = movement.endPosition;
      let pick = viewer.scene.pick(endPos);
      if (Cesium.defined(pick) && pick.id) {
        const pickEntity = pick.id;
        // GeoType和Editable字段结合态势标绘理解
        if (pickEntity.GeoType && pickEntity.Editable) {
          viewer.container.style.cursor = "pointer";
          showToolTip(pickEntity.GeoType, $this._toolTip, endPos, true);
        } else {
          viewer.container.style.cursor = "default";
          removeToolTip($this._toolTip);
        }
      } else {
        viewer.container.style.cursor = "default";
        removeToolTip($this._toolTip);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this._moveHandler.setInputAction(function (event: any) {
      const pos = event.position;
      let pick = viewer.scene.pick(pos);
      if (Cesium.defined(pick) && pick.id) {
        const pickEntity = pick.id;
        if (
          pickEntity.GeoType &&
          pickEntity.Editable &&
          pickEntity.id.indexOf("edit_") < 0
        ) {
          $this.resetPick();
          $this.storageEntity(pickEntity);
        }
      } else {
        $this.resetPick();
        $this._preEntity = undefined;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  /**
   * 重置点选状态
   */
  resetPick() {
    const item = this._editCollection.find((ele: StorageEntity) => {
      return ele.id === this._preEntity?.id;
    });
    if (item) {
      item.source.show = true;
      item.target.show = false;
      this.removeProcessObj(item.processEntities!);
    }
  }
  /**
   * 存储编辑对象，并开始编辑
   * @param entity
   */
  storageEntity(entity: any) {
    this.destroyEditHandler();
    this._preEntity = entity;
    this._editHandler = new Cesium.ScreenSpaceEventHandler(
      window.Viewer.canvas
    );
    switch (entity.GeoType) {
      case "Point":
        this.startEditPoint(entity);
        break;
      case "Billboard":
        this.startEditBillboard(entity);
        break;
      case "Polyline":
        this.startEditPolyline(entity);
        break;
      case "Curve":
        this.startEditCurve(entity);
        break;
      case "Polygon":
        this.startEditPolygon(entity);
        break;
      case "RegularPolygon":
        this.startEditRegularPolygon(entity);
        break;
      default:
        break;
    }
  }
  /**
   * 开始编辑点
   * @param entity
   */
  startEditPoint(entity: any) {
    EditPoint(entity, this._editHandler, this._editCollection);
  }
  /**
   * 开始编辑折线
   * @param entity
   */
  startEditPolyline(entity: any) {
    EditPolyline(entity, this._editHandler, this._editCollection);
  }
  /**
   * 开始编辑多边形
   * @param entity
   */
  startEditPolygon(entity: any) {
    EditPolygon(entity, this._editHandler, this._editCollection);
  }
  /**
   * 开始编辑广告牌
   * @param entity
   */
  startEditBillboard(entity: any) {
    EditBillboard(entity, this._editHandler, this._editCollection);
  }
  /**
   * 开始编辑广告牌
   * @param entity
   */
  startEditCurve(entity: any) {
    EditCurve(entity, this._editHandler, this._editCollection);
  }
  /**
   * 开始编辑正多边形
   * @param entity
   */
  startEditRegularPolygon(entity: any) {
    EditRegularPolygon(entity, this._editHandler, this._editCollection);
  }
  /**
   * 保存编辑
   */
  saveAll() {
    this._editCollection.forEach((se: StorageEntity) => {
      se.source.show = true;
      let resultPos: any;
      switch (se.geoType.toUpperCase()) {
        case "POINT":
          resultPos = se.source.position.getValue();
          break;
        case "POLYLINE":
          resultPos = se.source.polyline.positions.getValue();
          break;
        case "POLYGON":
          resultPos = se.source.polygon.hierarchy.getValue();
          break;
        default: //remix类型
          resultPos = se.source.EditingPoint;
          break;
      }
      se.source.PottingPoint = Cesium.clone(resultPos, true);
      this._viewer.entities.remove(se.target);
      this.removeProcessObj(se.processEntities!);
    });
    this.destroy();
  }
  /**
   * 取消编辑
   */
  cancle() {
    this._editCollection.forEach((se: StorageEntity) => {
      se.source.show = true;
      const type = se.geoType.toUpperCase();
      if (type.indexOf("REMIX") < 0) {
        switch (type) {
          case "POINT":
            se.source.position = Cesium.clone(se.source.PottingPoint, true);
            break;
          case "POLYLINE":
            se.source.polyline.positions = Cesium.clone(
              se.source.PottingPoint,
              true
            );
            break;
          case "POLYGON":
            se.source.polygon.hierarchy = Cesium.clone(
              se.source.PottingPoint,
              true
            );
            break;
          default:
            break;
        }
      } else {
        const pos = Cesium.clone(se.source.PottingPoint, true);
        se.source.EditingPoint = pos;
        switch (type) {
          case "REMIX_CURVE":
            se.source.polyline.positions = createBezierPoints(pos);
            break;
          case "REMIX_REGULARPOLYGON":
            se.source.polygon.hierarchy = new Cesium.PolygonHierarchy(
              getRegularPoints(pos.center, pos.end, pos.num)
            );
            break;
          default:
            break;
        }
      }
 
      this._viewer.entities.remove(se.target);
      this.removeProcessObj(se.processEntities);
    });
    this.destroy();
  }
  /**
   * 移除过程对象
   * @param items
   */
  removeProcessObj(items: any[] | undefined) {
    items?.forEach((ele) => {
      this._viewer.entities.remove(ele);
    });
    items = [];
  }
  destroyEditHandler() {
    if (this._editHandler) {
      this._editHandler.destroy();
    }
  }
  /**
   * 注销
   */
  destroy() {
    this._moveHandler.destroy();
    this.destroyEditHandler();
    this._preEntity = undefined;
    this._editCollection = [];
    removeToolTip(this._toolTip);
  }
}
export default ObjectEdit;