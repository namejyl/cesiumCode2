import CreateRemindertip from '../thirdPart/ReminderTip';
import { getLabelText, newSessionid } from '../thirdPart/plotCommon';
import { getCatesian3FromPX } from '../thirdPart/Coordinate';

const Cesium = window.Cesium;
const CreateGltf = (viewer: any, handler: any, resultList: any[], options: any, callback?: Function) => {
  const id = options.id || newSessionid();
  const onground = options.onground || true;
  const color = options.color ? Cesium.Color.fromCssColorString(options.color) : Cesium.Color.WHITE;
  const text = getLabelText(options.text || 'undefined', 0);
  const size = options.size || '32';
  if (viewer.entities.getById(id)) throw new Error('the id parameter is an unique value');
  window.toolTip = '左键点击选择点位';
  handler.setInputAction((event: any) => {
    let pixPos = event.position;
    let cartesian = getCatesian3FromPX(viewer, pixPos);
    // -----------

    let heading = Cesium.Math.toRadians(0);
    //弧度的螺距分量。
    let pitch = 0;
    //滚动分量（以弧度为单位）
    let roll = 0;
    //HeadingPitchRoll旋转表示为航向，俯仰和滚动。围绕Z轴。节距是绕负y轴的旋转。滚动是关于正x轴。
    let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);

    const gltf = viewer.entities.add({
      name: 'Gltf模型Entity形式',
      position: cartesian,
      orientation: orientation,
      model: {
        uri: '/public/glb/Cesium_Air.glb',
        scale: 300
      }
    });
    viewer.flyTo(viewer.entities);

    // ---------
    gltf.GeoType = 'Gltf'; //记录对象的类型，用户后续编辑等操作
    gltf.PottingGltf = {
      position: cartesian,
      orientation: orientation
    }; //记录对象的节点数据，用户后续编辑等操作
    gltf.EditingGltf = {
      position: cartesian,
      orientation: orientation
    }; //记录对象的节点数据，用户后续编辑等操作
    gltf.Editable = true; //代表当前对象可编辑,false状态下不可编辑
    resultList.push(gltf);
    handler.destroy();
    CreateRemindertip(window.toolTip, event.position, false);
    if (callback && typeof callback == 'function') callback(gltf);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction((movement: any) => {
    //console.log('鼠标移动事件监测：------创建文本------');
    let endPos = movement.endPosition;
    CreateRemindertip(window.toolTip, endPos, true);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

export default CreateGltf;
