const tiffPath = 'http://127.0.0.1:5174/tif/2.tif';
const tiff = await GeoTIFF.fromUrl(tiffPath);
const image = await tiff.getImage();
const [minX, maxY] = image.getOrigin(); // 左下角坐标
const width = image.getWidth();
const height = image.getHeight();
const res = image.getResolution(); // 以米/像素为单位的分辨率
// 计算右下角的坐标
const maxX = minX + width * res[0];
const minY = maxY - height * res[0];
// 输出四个角的坐标
console.log({
  左上角: [minX, maxY],
  右上角: [maxX, maxY],
  左下角: [minX, minY],
  右下角: [maxX, minY]
});
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
console.log(`中心经纬度 Longitude: ${centerX}, Center Latitude: ${centerY}`);
