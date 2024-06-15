<template>
  <div class="map">
    <div id="cesiumContainer">
      <div id="slider"></div>
    </div>
    <div id="eye"></div>
    <PlottingTool v-if="PlottingToolShow"></PlottingTool>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import PlottingTool from '../components/PlottingTool.vue';
const Cesium = window.Cesium;
const PlottingToolShow = ref(false);
let viewer: any;
onMounted(async () => {
  // let key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjUwNWQyOC0yZmZhLTRmMzItOTQyZC02ZmQyMWIyMTA3NmEiLCJpZCI6NjcyNzcsImlhdCI6MTY2ODE1ODc2Mn0.t1h6-ZADkGnZUZZoLtrlgtTp8_MR2Kxfhew42ksDgmk';
  // Cesium.Ion.defaultAccessToken = key;
  viewer =
    window.viewer =
    window.Viewer =
      new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        }),
        contextOptions: {
          webgl: {
            alpha: true
          }
        },
        terrainProvider: await Cesium.createWorldTerrainAsync(),
        geocoder: true,
        homeButton: true,
        sceneModePicker: true,
        baseLayerPicker: true,
        navigationHelpButton: true,
        animation: true,
        timeline: true,
        fullscreenButton: false,
        vrButton: false,
        //关闭点选出现的提示框
        selectionIndicator: false,
        infoBox: false
      });
  viewer.scene.debugShowFramesPerSecond = true;
  // 关闭深度检测
  viewer.scene.globe.depthTestAgainstTerrain = false;
  viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权
  PlottingToolShow.value = true;
});
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
#cesiumContainer {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('https://t11.baidu.com/it/u=1152680588,219410869&fm=30&app=106&f=JPEG?w=640&h=458&s=F93A7EDBC4E64D1563A5E31A03006057') no-repeat;
  background-size: 100% 100%;
  .my-Select {
    position: absolute;
    margin: 10px;
    padding: 10px;
    border: 1px solid red;
    border-radius: 4px;
    z-index: 10;
  }
}
/* 鹰眼图 */
#eye {
  position: absolute;
  right: 30px;
  bottom: 100px;
  border-radius: 50%;
  height: 160px;
  width: 160px;
  overflow: hidden;
  border: 2px solid #002fa7;
  display: none;
}
/* 屏幕分隔 */
#slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 5px;
  height: 100%;
  z-index: 9999;
  display: none;
}
#slider:hover {
  cursor: ew-resize;
}
</style>
