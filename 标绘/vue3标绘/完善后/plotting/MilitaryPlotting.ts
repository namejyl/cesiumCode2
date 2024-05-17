import * as Creator from './create/index';
import CreateRemindertip from './thirdPart/ReminderTip';
import ObjectEdit from './edit/index';
import { exportDatas, loadConfigJson } from './export/index'; //导出文件
const Cesium = window.Cesium;
interface PlotObject {
  [key: string]: any[];
}
class MilitaryPlotting {
  viewer: any; //三维场景
  resultObject: PlotObject; //标绘结果
  handler: any;
  edit: ObjectEdit;
  constructor(viewer: any) {
    if (!viewer) throw new Error('no viewer object!');
    this.viewer = viewer;
    this.resultObject = {
      point: [], //点Entity集合
      billboard: [], //广告牌Entity集合
      lineArrow: [], //简单箭头Entity集合
      swallowtailArrow: [], //燕尾箭头Entity集合
      straightArrow: [], //直线箭头Entity集合
      rightAngleArrow: [], //直角箭头Entity集合
      rectangle: [], //矩形Entity集合
      roundRectangle: [], //圆角矩形Entity集合
      sector: [], //扇形Entity集合
      elliptic: [], //椭圆Entity集合
      circle: [], //圆Entity集合
      bow: [], //弓形Entity集合
      pincerArrow: [], //钳击箭头Entity集合
      attackArrow: [], //进攻箭头Entity集合
      assemble: [], //集结地Entity集合
      flag: [], //旗标Entity集合
      freeLine: [], //自由线Entity集合
      polyline: [], //折线Entity集合
      curve: [], //圆滑曲线Entity集合
      freePolygon: [], //自由面Entity集合
      polygon: [], //多边形Entity集合
      regularPolygon: [], //正多边形Entity集合
      formation: [], //阵型Entity集合（防御和进攻阵型）
      label: [], //文本Entity集合
      gltf: [] //模型Entity集合
    };
    this.handler = undefined;
    this.edit = new ObjectEdit(viewer);
    // 关闭Cesium默认双击实体会调用trackedEntity方法
    viewer.trackedEntity = undefined;
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  /**
   * 绘制点
   * @param options - 参数，不传参为{}
   * @param callback - 回调函数
   */
  DrawPoint(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreatePoint(this.viewer, this.handler, this.resultObject.point, options, callback);
  }
  /**
   * 绘制折线
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawPolyline(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreatePolyline(this.viewer, this.handler, this.resultObject.polyline, options, callback);
  }
  /**
   * 绘制多边形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawPolygon(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreatePolygon(this.viewer, this.handler, this.resultObject.polygon, options, callback);
  }
  /**
   * 绘制广告版
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawBillboard(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateBillboard(this.viewer, this.handler, this.resultObject.billboard, options, callback);
  }
  /**
   * 绘制圆滑曲线
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawCurve(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateCurve(this.viewer, this.handler, this.resultObject.curve, options, callback);
  }
  /**
   * 绘制自由线
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawFreeLine(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateFreeLine(this.viewer, this.handler, this.resultObject.freeLine, options, callback);
  }
  /**
   * 绘制正多边形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawRegularPolygon(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateRegularPolygon(this.viewer, this.handler, this.resultObject.regularPolygon, options, callback);
  }
  /**
   * 绘制自由多边形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawFreePolygon(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateFreePolygon(this.viewer, this.handler, this.resultObject.freePolygon, options, callback);
  }
  /**
   * 绘制椭圆
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawElliptic(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateElliptic(this.viewer, this.handler, this.resultObject.elliptic, options, callback);
  }
  /**
   * 绘制圆
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawCircle(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateCircle(this.viewer, this.handler, this.resultObject.circle, options, callback);
  }
  /**
   * 绘制矩形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawRectangle(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateRectangle(this.viewer, this.handler, this.resultObject.rectangle, options, callback);
  }
  /**
   * 绘制集结地
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawAssemble(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateAssemble(this.viewer, this.handler, this.resultObject.assemble, options, callback);
  }
  /**
   * 绘制简单箭头-包括直线和曲线
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawLineArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateLineArrow(this.viewer, this.handler, this.resultObject.lineArrow, options, callback);
  }
  /**
   * 绘制攻击箭头
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawAttackArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateAttackArrow(this.viewer, this.handler, this.resultObject.attackArrow, options, callback);
  }
  /**
   * 绘制直角箭头
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawRightAngleArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateRightAngleArrow(this.viewer, this.handler, this.resultObject.rightAngleArrow, options, callback);
  }
  /**
   * 绘制燕尾箭头
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawSwallowtailArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateSwallowtailArrow(this.viewer, this.handler, this.resultObject.swallowtailArrow, options, callback);
  }
  /**
   * 绘制钳击箭头
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawPincerArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreatePincerArrow(this.viewer, this.handler, this.resultObject.pincerArrow, options, callback);
  }
  /**
   * 绘制直线箭头
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawStraightArrow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateStraightArrow(this.viewer, this.handler, this.resultObject.straightArrow, options, callback);
  }
  /**
   * 绘制旗标
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawFlag(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateFlag(this.viewer, this.handler, this.resultObject.flag, options, callback);
  }
  /**
   * 绘制阵型
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawFormation(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateFormation(this.viewer, this.handler, this.resultObject.formation, options, callback);
  }
  /**
   * 绘制弓形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawBow(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateBow(this.viewer, this.handler, this.resultObject.bow, options, callback);
  }
  /**
   * 绘制圆角矩形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawRoundRectangle(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateRoundRectangle(this.viewer, this.handler, this.resultObject.roundRectangle, options, callback);
  }
  /**
   * 绘制扇形
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawSector(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateSector(this.viewer, this.handler, this.resultObject.sector, options, callback);
  }
  /**
   * 文本标注
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawLabel(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateLabel(this.viewer, this.handler, this.resultObject.label, options, callback);
  }
  /**
   * 模型标注
   * @param options - 参数，不传参为{}
   * @param callback  回调函数
   */
  DrawGltf(options: any, callback?: Function) {
    this.initHandler();
    Creator.CreateGltf(this.viewer, this.handler, this.resultObject.gltf, options, callback);
  }
  /**
   * 初始化handler句柄
   */
  initHandler() {
    if (this.handler && !this.handler.isDestroyed()) {
      CreateRemindertip(window.toolTip, null, false);
      this.handler.destroy();
    }
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  /**
   * 加载自定义的JSON文件
   * @param json
   */
  loadJson(json: any) {
    console.log('111111111111', json, this.resultObject);
    return this.resultObject;
    // loadConfigJson(json, this.resultObject, this.viewer);
  }
  /**
   * 将标绘结果导出为自定义的JSON文件
   */
  exportAll(type: string) {
    console.log('Xxxxxxxxxxxx', type, this.resultObject);
    // exportDatas(type, this.resultObject);
  }
  /**
   * 清除所有创建的对象
   */
  clearAll() {
    for (const key in this.resultObject) {
      if (Object.hasOwnProperty.call(this.resultObject, key)) {
        const element = this.resultObject[key];
        for (let index = 0; index < element.length; index++) {
          const el = element[index];
          this.viewer.entities.remove(el);
          element.splice(index, 1);
          index -= 1;
        }
      }
    }
  }
  /**
   * 注销
   */
  destroy() {
    this.initHandler();
    this.handler.destroy();
    this.clearAll();
  }
}
export default MilitaryPlotting;
