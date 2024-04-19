<template>
  <div id="cesiumContainer">
    <PlottingTool class="tools" v-if="finished"></PlottingTool>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PlottingTool from './components/PlottingTool.vue';
const Cesium = window.Cesium;
let viewer: any = undefined;
let finished = ref(false);
onMounted(() => {
  let key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjUwNWQyOC0yZmZhLTRmMzItOTQyZC02ZmQyMWIyMTA3NmEiLCJpZCI6NjcyNzcsImlhdCI6MTY2ODE1ODc2Mn0.t1h6-ZADkGnZUZZoLtrlgtTp8_MR2Kxfhew42ksDgmk';
  Cesium.Ion.defaultAccessToken = key;
  viewer = window.Viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    }),
    terrainProvider: Cesium.createWorldTerrain(),
    geocoder: true,
    homeButton: true,
    sceneModePicker: true,
    baseLayerPicker: true,
    navigationHelpButton: true,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    //关闭点选出现的提示框
    selectionIndicator: false,
    infoBox: false
  });
  viewer.scene.debugShowFramesPerSecond = true;
  viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权
  viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度检测
  viewer.camera.setView({
    destination: {
      x: -1671393.457700136,
      y: 5305489.7330752695,
      z: 3123615.853972996
    },
    orientation: {
      heading: 0.01866314326549201,
      pitch: -0.5411512858156549,
      roll: 0.0000408822770285866
    }
  });
  finished.value = true;
});
</script>

<style lang="scss" scoped>
#cesiumContainer {
  position: relative;
  width: 100%;
  height: 100%;

  .tools {
    position: absolute;
    top: 0px;
    left: 0px;
    margin: 10px;
    padding: 10px;
    border: 1px solid red;
    border-radius: 4px;
    z-index: 10;
  }
}
</style>
