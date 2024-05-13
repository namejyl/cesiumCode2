// 官网  https://github.com/hongfaqiu/TIFFImageryProvider?tab=readme-ov-file
const setTifFn = async tiffPath => {
  if (thisProvider) {
    viewer.imageryLayers.remove(thisProvider); // 重置场景
  }
  const tiff = await GeoTIFF.fromUrl(tiffPath);
  const image = await tiff.getImage();
  const [minX, maxY] = image.getOrigin();
  const width = image.getWidth();
  const height = image.getHeight();
  const res = image.getResolution();
  const maxX = minX + width * res[0];
  const minY = maxY - height * res[0];
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const provider = await TIFFImageryProvider.fromUrl(tiffPath, {
    renderOptions: {
      single: {
        band: 1,
        colorScale: 'rainbow',
        colors: ['rgba(154, 206, 127,0.3)', 'rgba(163, 214, 245,0.3)', 'rgba(255, 251, 177,0.3)', 'rgba(193, 114, 97,0.3)', 'rgba(220, 100, 120,0.3)', 'rgba(49, 173, 105,0.3)'],
        type: 'continuous'
      }
    }
  });
  thisProvider = viewer.imageryLayers.addImageryProvider(provider);
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(centerX, centerY, 15000.0)
  });
};
