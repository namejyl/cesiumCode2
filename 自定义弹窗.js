const drawMapFN = async (obj: any) => {
  window.drawHelperDf.removeAll(); //重置场景
  window.earth.entities.removeAll();
  for (let i in markerDataAll) {
    markerDataAll[i].removeFrom(window.earth.features);
  }
  markerDataAll = [];
  for (let i in obj) {
    let str = '';
    let jd = null;
    let wd = null;
    for (let k in obj[i]) {
      if (k == '经度') {
        jd = obj[i][k];
      }
      if (k == '纬度') {
        wd = obj[i][k];
      }
      for (let y in getQxswFxsjData) {
        let li = `<div class="li" style="display: flex;">
              <div class="key">时间:${getQxswFxsjData[y].sjsj}-</div>
              <div class="value">天气:${getQxswFxsjData[y].tqzk}-</div>
              <div class="value">风速:${getQxswFxsjData[y].fs}m/s-</div>
              <div class="value">降水量:${getQxswFxsjData[y].jsl}mm-</div>
              <div class="value">气温:${getQxswFxsjData[y].qw}℃</div>
          </div>`;
        str = str + li;
      }
    }
    if (!str) {
      str = `<div class="noElData" style="height: 350px;line-height: 350px;width: 100%;text-align: center;">暂无数据</div>`;
    }
    let markerData = new window.GeoVis.Marker([Number(jd), Number(wd), 0], {
      icon: marker1,
      width: 30,
      height: 30,
      adapt: true
    }).addTo(window.earth.features);
    obj[i]['markerData'] = markerData;
    markerData.bindPopup(
      `<div class='markerData' style="width: 750px;height: 400px;overflow: scroll;">
         ${str}
          </div>`,
      710,
      false
    );
    markerDataAll.push(markerData);
  }
};
