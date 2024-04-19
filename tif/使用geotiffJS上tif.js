const { fromUrl, fromUrls, fromArrayBuffer, fromBlob } = window.GeoTIFF;
const setTifFn = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  axios.get('/tif/普天间航空站/0e87918e39ee449eb721fb0f4d2b4980.tif', { responseType: 'blob' }).then(async res => {
    const tiff = await fromBlob(res.data);
    let image = await tiff.getImage();
    let [west, south, east, north] = image.getBoundingBox();
    const code = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;
    const [red = [], green = [], blue = []] = await image.readRasters();
    const canvas = document.createElement('canvas');
    let width = image.getWidth();
    let height = image.getHeight();
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.createImageData(width, height);
    for (var i = 0; i < imageData.data.length / 4; i += 1) {
      imageData.data[i * 4 + 0] = red[i];
      imageData.data[i * 4 + 1] = green[i] || 0;
      imageData.data[i * 4 + 2] = blue[i] || 0;
      imageData.data[i * 4 + 3] = red[i] === 0 ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);
    let rectangle = window.Cesium.Rectangle.fromDegrees(west, south, east, north);
    let du = canvas.toDataURL();
    window.Viewer.imageryLayers.addImageryProvider(
      new window.Cesium.SingleTileImageryProvider({
        url: du,
        rectangle
      })
    );
    window.Viewer.camera.setView({
      destination: rectangle
    });
    loading.close();
  });
};
