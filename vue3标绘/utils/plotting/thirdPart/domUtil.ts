import { transformWGS84ToCartesian } from './Coordinate';
import { getLabelText } from './plotCommon';
// import '../index.css';
import '../index.css'
const Cesium = window.Cesium;
interface WindowPos {
  x: number;
  y: number;
}
interface AttributeOption {
  id: string;
  coord: { x: number; y: number; z: number };
  size: string;
  text: string;
}
export class LabelAttributeForm {
  _viewer: any;
  _winPos: WindowPos;
  _id: string;
  _coord: { x: number; y: number; z: number };
  _size: string;
  _text: string;
  _customDiv: HTMLElement | null;
  constructor(viewer: any, winPos: WindowPos, options: AttributeOption) {
    this._winPos = winPos;
    this._viewer = viewer;
    this._id = options.id || 'undefined';
    this._coord = options.coord || new Cesium.Cartesian3();
    this._size = options.size || '45';
    this._text = options.text || 'null';
 
    this._customDiv = null;
    this.initDom();
  }
  initDom() {
    this._customDiv = document.getElementById('label-attribute-form');
    if (!this._customDiv) {
      this._customDiv = document.createElement('div');
      this._customDiv.id = 'label-attribute-form';
      this._viewer.container.appendChild(this._customDiv);
    }
    this._customDiv.style.top = this._winPos.y + 'px';
    this._customDiv.style.left = this._winPos.x + 'px';
    this._customDiv.innerHTML = ` 
    <div>
      <span class="title">对象编号：</span>
      <span>${this._id}</span>
    </div>
    <div>
      <span class="title">文字标签：</span>
      <input type="text" id="text-value" value="${this._text}" />
    </div>
    <div>
      <span class="title">经纬坐标：</span>
      <input type="text" id="coor-xy" value="${this._coord.x},${this._coord.y}" />
    </div>
    <div>
      <span class="title">字体大小：</span>
      <input type="number" id="font-size" value="${this._size}" />
    </div>
    <div class="label-ar-tool-box">
      <button id="label_edit_ok">确认</button>
      <button id="label_edit_no">取消</button>
    </div>`;
    this.initEvent();
  }
  initEvent() {
    const $this = this;
    let ok_bt = document.getElementById('label_edit_ok');
    if (ok_bt) {
      ok_bt.onclick = function (e) {
        $this.confirm(true);
      };
    }
    let no_bt = document.getElementById('label_edit_no');
    if (no_bt) {
      no_bt.onclick = function (e) {
        $this.confirm(false);
      };
    }
  }
  confirm(bool: boolean) {
    let entity = this._viewer.entities.getById(this._id.substring(5));
    let editEntity = this._viewer.entities.getById(this._id);
    if (bool) {
      let coordDom: any = document.getElementById('coor-xy');
      const pos = coordDom.value.split(',');
      const car3 = transformWGS84ToCartesian({
        x: Number(pos[0]),
        y: Number(pos[1]),
        z: 0,
      });
      editEntity.position = new Cesium.CallbackProperty(() => {
        return car3;
      }, false);
      let textDom: any = document.getElementById('text-value');
      const text = getLabelText(textDom.value, 1);
 
      editEntity.label.text = new Cesium.CallbackProperty(() => {
        return text;
      }, false);
      let fontDom: any = document.getElementById('font-size');
      const font = fontDom.value + 'px Helvetica';
      editEntity.label.font = new Cesium.CallbackProperty(() => {
        return font;
      }, false);
    }
    this.destroy();
  }
  destroy() {
    this._viewer.container.removeChild(this._customDiv);
  }
}