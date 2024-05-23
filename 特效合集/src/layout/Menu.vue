<template>
  <el-container class="layout-container-demo" style="height: 100%">
    <el-aside width="200px">
      <el-scrollbar>
        <el-menu>
          <el-sub-menu v-for="(item, index) in listData" :key="index" :index="item.value">
            <template #title>
              <el-icon><setting /></el-icon>{{ item.value }}
            </template>
            <el-menu-item-group>
              <el-menu-item @click="SettingCesiumFn(item1.code)" v-for="(item1, index1) in item.children" :key="index1" :index="item1.value">{{ item1.value }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container>
      <el-main>
        <Map></Map>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { Menu as Setting } from '@element-plus/icons-vue';
import Map from './Map.vue';
import CesiumMap from '../code/index.ts';
const listData = reactive<any>([
  {
    value: '各类数据加载',
    label: '各类数据加载',
    children: [
      {
        value: '加载天地图wmts服务',
        label: '加载天地图wmts服务',
        code: 'AddTiandituWmts'
      },
      {
        value: '加载XYZ瓦片服务',
        label: '加载XYZ瓦片服务',
        code: 'AddXyz'
      },
      {
        value: '加载3DTileset模型',
        label: '加载3DTileset模型',
        code: 'Add3DTileset'
      },
      {
        value: '加载geojson数据',
        label: '加载geojson数据',
        code: 'AddGeoJson'
      },
      {
        value: '加载json数据',
        label: '加载json数据',
        code: 'AddJson'
      },
      {
        value: '加载kml数据',
        label: '加载kml数据',
        code: 'AddKml'
      },
      {
        value: '加载czml数据',
        label: '加载czml数据',
        code: 'AddCzml'
      }
    ]
  },
  {
    value: '地图场景和场景效果',
    label: '地图场景和场景效果',
    children: [
      {
        value: '鹰眼图',
        label: '鹰眼图',
        code: 'Eye'
      },
      {
        value: '分屏',
        label: '分屏',
        code: 'Split'
      },
      {
        value: '反选遮罩',
        label: '反选遮罩',
        code: 'Mask'
      },
      {
        value: '地球自转(10秒停止)',
        label: '地球自转(10秒停止)',
        code: 'Rotate'
      },
      {
        value: '昼夜交替',
        label: '昼夜交替',
        code: 'UpdateLighting'
      },
      {
        value: '日照阴影模拟效果',
        label: '日照阴影模拟效果',
        code: 'SunShadows'
      },
      {
        value: '多彩矩形地球球体',
        label: '多彩矩形地球球体',
        code: 'InitColorfulRectEarth'
      },
      {
        value: '自定义球体背景',
        label: '自定义球体背景',
        code: 'SetBackground'
      },
      {
        value: '自定义天空盒',
        label: '自定义天空盒',
        code: 'CustomSkyBox'
      },
      {
        value: '场景出图',
        label: '场景出图',
        code: 'SaveOutImg'
      }
    ]
  },
  {
    value: '量测、绘制、查询',
    label: '量测、绘制、查询',
    children: [
      {
        value: '三维量测(measure)',
        label: '三维量测(measure)'
      },
      {
        value: '鼠标绘制',
        label: '鼠标绘制'
      },
      {
        value: '信息查询',
        label: '信息查询'
      }
    ]
  },
  {
    value: '要素与特效(线/面/墙)',
    label: '要素与特效(线/面/墙)',
    children: [
      {
        value: '旋转实体',
        label: '旋转实体',
        code: 'RotateEntity'
      },
      {
        value: '道路流动线效果',
        label: '道路流动线效果',
        code: 'RoadShuttle'
      },
      {
        value: '道路闪烁线效果',
        label: '道路闪烁线效果',
        code: 'RoadFlashing'
      },
      {
        value: '竖直飞线效果',
        label: '竖直飞线效果',
        code: 'LineFlowInit'
      },
      {
        value: '抛物流动飞线效果',
        label: '抛物流动飞线效果',
        code: 'ParabolaFlowInit'
      },
      {
        value: '面状要素的立体拉伸效果',
        label: '面状要素的立体拉伸效果',
        code: 'SurfaceElementStretching'
      },
      {
        value: '六边形扩散效果',
        label: '六边形扩散效果',
        code: 'HexagonDiffusion'
      },
      {
        value: '动态流动水面',
        label: '动态流动水面',
        code: 'FlowingWaterSurface'
      },
      {
        value: '加载Polygon绘制墙',
        label: '加载Polygon绘制墙',
        code: 'DrawWall'
      },
      {
        value: '动态立体墙效果',
        label: '动态立体墙效果',
        code: 'DynamicWall'
      },
      {
        value: '动态流动墙体效果',
        label: '动态流动墙体效果',
        code: 'FlowWall'
      },
      {
        value: '动态扩散墙效果',
        label: '动态扩散墙效果',
        code: 'DiffusionWall'
      },
      {
        value: '正多边形扩散墙效果',
        label: '正多边形扩散墙效果'
      },
      {
        value: '立体墙（垂直、水平）渐变泛光效果',
        label: '立体墙（垂直、水平）渐变泛光效果'
      }
    ]
  },
  {
    value: '要素与特效(圆)',
    label: '要素与特效(圆)',
    children: [
      {
        value: '旋转圆',
        label: '旋转圆'
      },
      {
        value: '扫描圆',
        label: '扫描圆'
      },
      {
        value: '波纹圆',
        label: '波纹圆'
      },
      {
        value: '扩散圆',
        label: '扩散圆'
      },
      {
        value: '消隐圆',
        label: '消隐圆'
      },
      {
        value: '模糊圆',
        label: '模糊圆'
      },
      {
        value: '螺旋圆',
        label: '螺旋圆'
      },
      {
        value: '多彩圆',
        label: '多彩圆'
      },
      {
        value: '脉冲圆',
        label: '脉冲圆'
      },
      {
        value: '水波纹扩散效果',
        label: '水波纹扩散效果'
      },
      {
        value: '圆扩散效果',
        label: '圆扩散效果'
      },
      {
        value: '线圈发光效果',
        label: '线圈发光效果'
      },
      {
        value: '雷达平扫效果',
        label: '雷达平扫效果'
      },
      {
        value: '雷达线效果',
        label: '雷达线效果'
      },
      {
        value: '波纹雷达效果',
        label: '波纹雷达效果'
      },
      {
        value: '图片雷达效果',
        label: '图片雷达效果'
      },
      {
        value: '雷达扫描效果2',
        label: '雷达扫描效果2'
      },
      {
        value: '立体雷达扫描效果',
        label: '立体雷达扫描效果'
      }
    ]
  },
  {
    value: '球/广告牌/模型',
    label: '球/广告牌/模型',
    children: [
      {
        value: '轨迹球体效果',
        label: '轨迹球体效果'
      },
      {
        value: '电弧球体效果',
        label: '电弧球体效果'
      },
      {
        value: '广告牌效果',
        label: '广告牌效果'
      },
      {
        value: '3D Tiles(建筑物渐变和动态光环)',
        label: '3D Tiles(建筑物渐变和动态光环)'
      },
      {
        value: 'glb模型(键盘控制模型姿态)',
        label: 'glb模型(键盘控制模型姿态)'
      },
      {
        value: 'glb模型(轨迹移动)',
        label: 'glb模型(轨迹移动)'
      },
      {
        value: '点聚合',
        label: '点聚合'
      }
    ]
  },
  {
    value: '空间分析',
    label: '空间分析',
    children: [
      {
        value: '淹没分析',
        label: '淹没分析'
      },
      {
        value: '通视分析',
        label: '通视分析'
      },
      {
        value: '可视域分析',
        label: '可视域分析'
      },
      {
        value: '等高线',
        label: '等高线'
      },
      {
        value: '剖面分析',
        label: '剖面分析'
      },
      {
        value: '地形开挖',
        label: '地形开挖'
      },
      {
        value: '填挖方计算',
        label: '填挖方计算'
      },
      {
        value: '地形三角网',
        label: '地形三角网'
      },
      {
        value: '热力图',
        label: '热力图'
      },
      {
        value: '立体热力图',
        label: '立体热力图'
      },
      {
        value: 'threejs+cesium',
        label: 'threejs+cesium'
      }

      //   {
      //   value: "坡度坡向分析",
      //   label: "坡度坡向分析"
      // }
    ]
  },
  {
    value: '特效',
    label: '特效',
    children: [
      {
        value: '下雪天效果',
        label: '下雪天效果'
      },
      {
        value: '下雨天效果',
        label: '下雨天效果'
      },
      {
        value: '雾天效果',
        label: '雾天效果'
      },
      {
        value: '粒子特效',
        label: '粒子特效'
      }
    ]
  },
  {
    value: '第三方支持',
    label: '第三方支持',
    children: [
      {
        value: 'threejs',
        label: 'threejs'
      },
      {
        value: 'Echarts-饼图',
        label: 'Echarts-饼图'
      },
      {
        value: 'Echarts-散点图',
        label: 'Echarts-散点图'
      },
      {
        value: 'Echarts-飞行路线图',
        label: 'Echarts-飞行路线图'
      },
      {
        value: 'Echarts-流入图',
        label: 'Echarts-流入图'
      },
      {
        value: 'Echarts-基础柱状图',
        label: 'Echarts-基础柱状图'
      },
      {
        value: 'Echarts-光柱柱状图',
        label: 'Echarts-光柱柱状图'
      }
    ]
  }
]);
const SettingCesiumFn = async (code: any) => {
  console.log('2222222222', code);
  CesiumMap[code]();
};
</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
