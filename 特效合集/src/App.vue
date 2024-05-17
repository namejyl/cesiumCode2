<template>
  <RouterView />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
<style scoped>
* {
  padding: 0;
  margin: 0;
  font-family: 微软雅黑Bbold, serif;
}

ul,
ol,
li {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  font-family: 微软雅黑Bbold, serif;
}

#app {
  box-sizing: border-box;
  font-family: Microsoft YaHei;
}
</style>
