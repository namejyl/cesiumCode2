<template>
  <div class="plotting-tool-main">
    <div class="plot-load-export">
      <input type="file" accept=".json" @change="handleFileChange" />
      <el-button size="small" type="primary" @click="addJson">加载已选</el-button>
      <span class="split-line"></span>
      <el-button size="small" type="success" @click="exportJson">导出所有</el-button>
      <el-select class="export-type" v-model="exportType" size="small">
        <el-option v-for="item in exportTypes" :key="item.id" :label="item.label" :value="item.id"> </el-option>
      </el-select>
    </div>
    <div class="draw-options">
      <div class="plot-color">
        <label>色板：</label>
        <el-color-picker v-model="color" show-alpha size="small" />
      </div>
      <div class="plot-edit">
        <label>编辑器:</label>
        <el-switch size="small" v-model="boolEdit" inline-prompt active-text=" 退出编辑 " inactive-text=" 开始编辑 " />
        <div class="edit-button">
          <el-button size="small" @click="save(true)" :disabled="!boolEdit">保存</el-button>
          <el-button size="small" @click="save(false)" :disabled="!boolEdit">取消</el-button>
          <el-button size="small" @click="clearAll()">清除所有</el-button>
          <el-button size="small" @click="exportMap()">成果出图</el-button>
        </div>
      </div>
    </div>
    <div class="draw-tab">
      <span v-for="item in drawTabs" :key="item.id" @click="activeTab = item.id" :class="{ active: activeTab === item.id }">{{ item.name }}</span>
    </div>
    <div class="draw-main vector" v-if="activeTab === 'vector'">
      <span v-for="item in items" :key="item.id" class="item pointer" :class="{ active: item.finished }" @click="startDrawItem(item.id)">
        <img :src="getImage(item.id)" />
        <label>{{ item.label }}</label>
      </span>
    </div>
    <div class="draw-main texts" v-if="activeTab === 'text'">
      <el-input v-model="textVal" autosize type="textarea" placeholder="请输入标注文本....." />
      <el-button size="small" @click="startDrawItem('label')" :disabled="textVal.trim() === ''">添加标注</el-button>
    </div>
    <div class="draw-main images" v-if="activeTab === 'images'">
      <el-collapse v-model="activeImages" accordion class="custom-collapse">
        <el-collapse-item v-for="(value, key) in images" :key="key" :title="value.title" :name="key">
          <div class="list-img">
            <img v-for="item in value.items" :src="getImage(key + '/' + item.fileName)" @click="drawImages(key + '/' + item.fileName)" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="draw-main models" v-if="activeTab === 'models'">
      <el-collapse v-model="activeModels" accordion class="custom-collapse">
        <el-collapse-item v-for="(value, key) in models" :key="key" :title="value.title" :name="key">
          <div class="list-model">
            <img v-for="item in value.items" :src="getImage(key + '/' + item.fileName)" @click="drawGltf(item.fileName)" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import MilitaryPlotting from '../utils/plotting/MilitaryPlotting';
import { PlotItems, ImagesPlotItems, ModelsPlotItems } from '../utils/plotting/config';
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
let mpTool: MilitaryPlotting;
onMounted(() => {
  mpTool = new MilitaryPlotting(window.Viewer);
});
const items = computed(() => PlotItems);
const getImage = (id: string) => {
  return getAssetsData(`images/plotting/${id}.png`);
};
const getGltfUrl = (id: string) => {
  return getAssetsData(`models/${id}/scene.gltf`);
};
/**
 * 获取静态资源路径
 * @param url 路径
 * @returns
 */
const getAssetsData = (url: string) => {
  return new URL(`../assets/${url}`, import.meta.url).href;
};
let activeId = ref('');
const startDrawItem = (id: string) => {
  activeId.value = id;
  switch (id) {
    case 'point':
      mpTool.DrawPoint({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'warning-point':
      mpTool.DrawBillboard({}, (res: any) => {
        customCallback(res);
      });
      break;
    case 'polyline':
      mpTool.DrawPolyline({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'curve':
      mpTool.DrawCurve({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'free-line':
      mpTool.DrawFreeLine({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'polygon':
      mpTool.DrawPolygon({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'free-polygon':
      mpTool.DrawFreePolygon({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'polygon-regular':
      mpTool.DrawRegularPolygon({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'triangle':
      mpTool.DrawRegularPolygon({ color: color.value, num: 3 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'bow':
      mpTool.DrawBow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'sector':
      mpTool.DrawSector({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'elliptic':
      mpTool.DrawElliptic({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'circle':
      mpTool.DrawCircle({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'rectangle':
      mpTool.DrawRectangle({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'round-rectangle':
      mpTool.DrawRoundRectangle({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'assemble':
      mpTool.DrawAssemble({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-easy':
      mpTool.DrawLineArrow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-right-angle':
      mpTool.DrawRightAngleArrow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-attack':
      mpTool.DrawAttackArrow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-straight':
      mpTool.DrawStraightArrow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-swallowtail':
      mpTool.DrawSwallowtailArrow({ color: color.value, type: 1 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-swallowtail2':
      mpTool.DrawSwallowtailArrow({ color: color.value, type: 2 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'arrow-pincer':
      mpTool.DrawPincerArrow({ color: color.value }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'flag-triangle':
      mpTool.DrawFlag({ color: color.value, type: 4 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'flag-triangle-regular':
      mpTool.DrawFlag({ color: color.value, type: 2 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'flag-triangle-inverted':
      mpTool.DrawFlag({ color: color.value, type: 3 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'flag-rectangle':
      mpTool.DrawFlag({ color: color.value, type: 1 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'flag-curve':
      mpTool.DrawFlag({ color: color.value, type: 0 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'defense':
      mpTool.DrawFormation({ color: color.value, type: 0 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'attack':
      mpTool.DrawFormation({ color: color.value, type: 1 }, (res: any) => {
        customCallback(res);
      });
      break;
    case 'label':
      mpTool.DrawLabel({ color: color.value, text: textVal.value }, (res: any) => {
        customCallback(res);
      });
      break;
    default:
      break;
  }
};
const customCallback = (item: any) => {
  console.log('标绘成功：', item);
  activeId.value = '';
  textVal.value = '';
};

const color = ref('rgba(255, 0, 0, 0.5)');

let boolEdit = ref<boolean>(false);
watch(boolEdit, val => {
  if (!mpTool) {
    mpTool = new MilitaryPlotting(window.Viewer);
  }
  mpTool.edit.enable = val;
});
const save = (bool: boolean) => {
  bool ? mpTool.edit.saveAll() : mpTool.edit.cancle();
  boolEdit.value = false;
};
const clearAll = () => {
  boolEdit.value && save(true);
  mpTool.clearAll();
};
let jsonFile: any = undefined;
const handleFileChange = (event: any) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    jsonFile = reader.result ? (jsonFile = JSON.parse(reader.result.toString())) : undefined;
  };
  reader.readAsText(file);
};
const addJson = () => {
  mpTool.loadJson(jsonFile);
};
let exportTypes = ref([
  { id: 'config', label: '自定义JSON' },
  { id: 'geojson', label: '标准Geojson' },
  { id: 'shp', label: 'Shapefile' }
]);
let exportType = ref('config');
const exportJson = () => {
  mpTool.exportAll(exportType.value);
};
let activeTab = ref('vector');
const drawTabs = ref([
  { id: 'vector', name: '矢量标绘' },
  { id: 'text', name: '文本标注' },
  { id: 'images', name: '图片标注' },
  { id: 'models', name: '模型标注' }
]);
let textVal = ref('');
const images = computed(() => ImagesPlotItems);
const activeImages = ref('');
const drawImages = (id: string) => {
  mpTool.DrawBillboard({ image: getImage(id) }, (res: any) => {
    customCallback(res);
  });
};
const models = computed(() => ModelsPlotItems);
const activeModels = ref('');
const drawGltf = (id: string) => {
  mpTool.DrawGltf({ url: getGltfUrl(id) }, (res: any) => {
    customCallback(res);
  });
};
const exportMap = () => {
  alert('功能开发设计中');
};
onBeforeUnmount(() => {
  mpTool.destroy();
});
</script>
<style lang="scss" scoped>
.plotting-tool-main {
  display: flex;
  flex-direction: column;
  background: #535353dd;
  color: #fff;
  gap: 10px;
  user-select: none;
  .plot-load-export {
    display: flex;
    align-items: center;
    .split-line {
      display: initial;
      border: 1px solid #32cde1;
      height: 15px;
      margin: 0 5px;
    }
    .export-type {
      width: 110px;
      margin-left: 3px;
    }
  }
  .draw-options {
    width: 100%;
    display: flex;
    gap: 25px;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid #32cde1;
    font-size: 15px;

    .plot-edit {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
  .draw-tab {
    font-size: 13px;
    letter-spacing: 1px;
    display: flex;
    color: #fff;
    cursor: pointer;
    span {
      border: 1px solid #32cce155;
      padding: 2px 10px;
      &:hover {
        background: #2594a344;
      }
      &.active {
        font-weight: bold;
        background: #2594a3cc;
      }
    }
  }
  .draw-main {
    width: 540px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    &.vector {
      .item {
        width: 20%;
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        gap: 4px;

        &:hover {
          color: aqua;
          font-weight: bold;
        }

        &.active {
          color: aqua;
          font-weight: bold;
        }

        img {
          width: 28px;
          height: 28px;
        }
      }
    }
    &.texts {
      flex-direction: column;
      gap: 10px;
      align-items: flex-end;
    }
    &.images {
      .custom-collapse {
        width: 100%;
        .list-img {
          display: flex;
          flex-wrap: wrap;
          column-gap: 8px;
          row-gap: 5px;
          img {
            height: 36px;
            border: 1px solid #ffffff22;
            padding: 3px;
            border-radius: 2px;
            &:hover {
              cursor: pointer;
              border: 1px solid #32cde1;
            }
          }
        }
      }
    }
    &.models {
      .custom-collapse {
        width: 100%;
        .list-model {
          display: flex;
          flex-wrap: wrap;
          column-gap: 8px;
          row-gap: 5px;
          img {
            height: 36px;
            border: 1px solid #ffffff22;
            padding: 3px;
            border-radius: 2px;
            &:hover {
              cursor: pointer;
              border: 1px solid #32cde1;
            }
          }
        }
      }
    }
    :deep(.el-collapse) {
      border: none;
      .el-collapse-item {
        .el-collapse-item__header {
          background: transparent;
          letter-spacing: 2px;
          font-weight: bold;
          color: #fff;
          border-bottom: 1px dashed #32cde180;
        }
        .el-collapse-item__wrap {
          background: transparent;
          border: none;
          .el-collapse-item__content {
            color: #fff;
            padding: 10px 0;
          }
        }
      }
    }
  }
}
</style>
