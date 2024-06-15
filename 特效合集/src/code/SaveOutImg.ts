const Cesium = window.Cesium;
export default () => {
  let viewer = window.Viewer;
  // 获取 Canvas 元素
  let canvas = viewer.scene.canvas;
  // 调整分辨率
  let resolutionScale = 1.0;
  let width = canvas.width * resolutionScale;
  let height = canvas.height * resolutionScale;
  // 创建离屏 Canvas
  let offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  let context: any = offscreenCanvas.getContext('2d');
  // 渲染场景
  viewer.render();
  // 拷贝当前场景内容到离屏 Canvas
  context.drawImage(canvas, 0, 0, width, height);
  // 将离屏 Canvas 转换为 Data URL
  let dataURL = offscreenCanvas.toDataURL('image/png');
  // 创建一个链接元素并下载图片
  let link = document.createElement('a');
  link.href = dataURL;
  link.download = 'cesium_scene.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
