// cesium 绘制toolTip
const CreateRemindertip = function (toolTip, position, show, arr) {
  let tooltip = document.getElementById('toolTip');
  let style, _x, _y, _color;
  if (arr && typeof arr === 'object') {
    style = arr;
  }
  if (style && style.origin) {
    style.origin === 'center' && ((_x = 15), (_y = -12));
    style.origin === 'top' && ((_x = 15), (_y = -44));
    style.origin === 'bottom' && ((_x = 15), (_y = 20));
  } else {
    (_x = 15), (_y = 20);
  }
  if (style && style.color) {
    style.color === 'white' && (_color = 'background: rgba(255, 255, 255, 0.8);color: black;');
    style.color === 'black' && (_color = 'background: rgba(0, 0, 0, 0.5);color: white;');
    style.color === 'yellow' && (_color = 'color: black;background-color: #ffcc33;border: 1px solid white;');
  } else {
    _color = 'background: rgba(0, 0, 0, 0.5);color: white;';
  }
  if (!tooltip) {
    const viewerDom = document.getElementsByClassName('cesium-viewer')[0];
    let elementbottom = document.createElement('div');
    viewerDom.append(elementbottom);
    // padding: 4px 8px;
    let html = '<div id="toolTip" style="display: none;pointer-events: none;position: absolute;z-index: 1000;opacity: 0.8;border-radius: 4px;white-space: nowrap;font-family:黑体;color:white;font-weight: bolder;font-size: 14px;' + _color + '"></div>';
    viewerDom.insertAdjacentHTML('beforeend', html);
    tooltip = document.getElementById('toolTip');
  }
  if (show) {
    tooltip.innerHTML = arr;
    tooltip.style.left = position.x + _x + 'px';
    tooltip.style.top = position.y + _y + 'px';
    tooltip.style.display = 'block';
    showAt(position, toolTip);
  } else {
    tooltip.style.display = 'none';
    show(show);
  }

  function showAt(position, text) {
    tooltip.innerHTML = text;
    if (style && style.origin) {
      style.origin === 'center' && ((_x = 15), (_y = -tooltip.offsetHeight / 2));
      style.origin === 'top' && ((_x = 15), (_y = -tooltipp.offsetHeight - 20));
      style.origin === 'bottom' && ((_x = 15), (_y = 20));
    } else {
      (_x = 15), (_y = -tooltip.offsetHeight / 2);
    }
    tooltip.style.left = position.x + _x + 'px';
    tooltip.style.top = position.y + _y + 'px';
    tooltip.style.display = 'block';
  }
  function show(show) {
    if (show) {
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  }
};
export default CreateRemindertip;
