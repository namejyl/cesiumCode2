if (data.mbnm) {
  this.targetId = String(data.mbnm);
  this.$refs.targetDetails.getApiSelectTargetDetail(data.mbnm, res => {
    let geoServerData = res.geoserverImageList[0].fwdz.split('?layers=');
    _this.tifLayer = new Cesium.WebMapServiceImageryProvider({
      url: process.env.VUE_APP_GEOAPIURL + geoServerData[0],
      layers: 'LFQ:' + geoServerData[1],
      style: 'raster',
      parameters: {
        service: 'WMS',
        format: 'image/png',
        transparent: true
        // srs:'EPSG:4326'
      }
    });
    let dataS = window.viewer.imageryLayers.addImageryProvider(_this.tifLayer);
    _this.defaultCheckedKeys = [2];
    this.layerList.push(dataS);
  });
  this.$refs.targetDetails.TabSwitch(3, data.mbnm);
  this.isdirectoryTreeDetails = true;
}

window.earth.imageryLayers.remove(tifAll[i]); // 重置场景
