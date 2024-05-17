<!--cesium地球-->
<template>
  <div class="home">
    <div id="cesiumContainer" ref="cesiumContainer">
      <div id="header">
        <p style="text-align: center; line-height: 50px; font-size: 30px">cesium演示效果</p>
      </div>
      <div id="menu">
        <el-menu @select="changeOptions" background-color="#1f5f9a" text-color="#fff" size="mini" active-text-color="#ffd04b">
          <template v-for="item in options">
            <!-- v-if条件渲染：如果出事渲染条件为假，则什么也不做，直到条件第一次变为真时，才会开始渲染条件块 -->
            <!-- v-show:不管初始条件是什么，元素总是会被渲染，并且只是简单地基于CSS的"display"属性进行切换 -->
            <!-- v-if 指令开销较大，所以更适合条件不经常改变的场景。而 v-show 指令适合条件频繁切换的场景 -->
            <!-- 包含子菜单的项 -->
            <el-submenu :index="item.value" :key="item.value">
              <template slot="title">
                {{ item.label }}
              </template>
              <el-menu-item v-for="_item in item.children" :key="_item.value" :index="_item.value">
                {{ _item.label }}
              </el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </div>
      <div id="outImg">
        <el-button type="primary" size="mini" @click="saveToImage">场景出图</el-button>
      </div>
      <div id="reset">
        <el-button type="primary" size="mini" @click="reset">清除重置</el-button>
      </div>
      <div id="split"></div>
      <!-- 三维量测控件面板 -->
      <el-card class="box-card" id="measurePanel">
        <!-- <div slot="header" style="text-align:center;">
          <span>三维量测面板</span>
        </div> -->
        <div>
          <div>
            量测：
            <el-button type="primary" size="mini" @click="ClampToGround">不贴地</el-button>
            <el-button type="success" size="mini" @click="SpaceDistance">空间距离</el-button>
            <el-button type="success" size="mini" @click="SpaceArea">空间面积</el-button>
            <el-button type="success" size="mini" @click="Triangulation">三角量测</el-button>
          </div>
          <br />
          <div>
            清除
            <el-button type="info" size="mini" @click="ClearanceMeasurement">清除量测</el-button>
          </div>
        </div>
      </el-card>
      <!-- 鼠标绘制面板 -->
      <el-card class="box-card" id="mouseDrawing">
        <p style="text-align: center">鼠标绘制：</p>
        <el-tabs type="border-card" v-model="tabsValue" @tab-click="drawHandleClick">
          <el-tab-pane name="drawPoint" label="点">允许用户点击地球的某个位置，然后在那个位置上添加一个红色的点，用户鼠标右击，结束绘制</el-tab-pane>
          <el-tab-pane name="drawPolyline" label="线">使用左键点击事件来添加点，创建一个折线实体来表示用户点击确定的所有点之间的线段。同时每当用户移动鼠标时，显示从最后一个点击位置到当前鼠标位置的一个动态线段。</el-tab-pane>
          <el-tab-pane name="drawCircle" label="圆">通过单击选择圆的中心，然后通过移动鼠标选择半径。当鼠标双击时，绘制将完成。</el-tab-pane>
          <el-tab-pane name="drawRectangle" label="矩形">首次单击选择左上角，移动鼠标调整矩形的大小，然后双击来结束绘制并保存矩形的点。通过捕获用户在地图上的鼠标操作来确定矩形的两个对角点，然后使用这两个点来定义矩形。</el-tab-pane>
          <el-tab-pane name="drawPolygon" label="多边形">点击地图以定义多边形的顶点，可以随着鼠标移动看到多边形的形状实时更新，通过双击结束多边形绘制</el-tab-pane>
          <el-tab-pane name="removeDraws" label="清除">清除所有绘制,请先选择其他项进行绘制</el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 信息查询面板 -->
      <el-card class="box-card" id="informationQuery">
        <p style="text-align: center">信息查询：</p>
        <el-tabs type="border-card" v-model="tabsValue_query" @tab-click="queryHandleClick">
          <el-tab-pane name="tapQuery" label="点击查询">
            <el-button @click="AddWMS" type="primary">加载wms服务</el-button>
            <el-descriptions title="" direction="vertical" :column="3" border>
              <el-descriptions-item label="几何类型">{{ clickQueryResult.type }}</el-descriptions-item>
              <el-descriptions-item label="名称">{{ clickQueryResult.name }}</el-descriptions-item>
              <el-descriptions-item label="编号">{{ clickQueryResult.id_0 }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane name="spaceQuery" label="空间查询">空间查询</el-tab-pane>
          <el-tab-pane name="propertyQuery" label="条件查询">
            <el-select v-model="value_Conditions" multiple collapse-tags style="margin-left: 20px" placeholder="请选择">
              <el-option v-for="item in options_Conditions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
            <el-button @click="propertyQuery" type="primary">加载服务</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 绕地旋转控件面板 -->
      <el-card class="box-card" id="rotatePanel">
        <div>
          <div>
            绕地旋转：
            <el-button type="primary" size="mini" @click="startRotate">开始绕地旋转</el-button>
            <el-button type="primary" size="mini" @click="endRotate">停止绕地旋转</el-button>
          </div>
        </div>
      </el-card>
      <!-- 淹没分析面板 -->
      <el-card class="box-card" id="induationAnalysisPanel">
        <div>
          <div>
            <p style="text-align: center">淹没分析</p>
            初始水位高度：<el-input size="mini" v-model="initialWater_Height" style="width: 100px">初始水位高度</el-input> 最大水位高度：<el-input size="mini" v-model="maxWater_Height" style="width: 100px">最大水位高度</el-input> 淹没速度：<el-input
              size="mini"
              v-model="submerge_Speed"
              style="width: 100px"
              >淹没速度：</el-input
            >
            <br />
            <div style="text-align: center; margin-top: 10px">
              <el-button type="primary" size="mini" @click="drawPolygon">绘制淹没分析区域</el-button>
              <el-button type="primary" size="mini" @click="startInduationAnalysis">开始淹没分析</el-button>
              <el-button type="primary" size="mini" @click="clearInduationAnalysis">清除</el-button>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 通视分析面板 -->
      <el-card class="box-card" id="visibilityAnalysisPanel">
        <div>
          <div>
            <div style="text-align: center; margin-top: 10px">
              <el-button type="primary" size="mini" @click="addViewPoint">添加视域点</el-button>
              <el-button type="primary" size="mini" @click="addTargetPoint">添加目标点</el-button>
              <el-button type="primary" size="mini" @click="startVisibilityAnalysis">通视分析</el-button>
              <el-button type="primary" size="mini" @click="clearResults">清除</el-button>
            </div>
            说明：点击地图添加视域点和目标点（添加后，分别右键结束添加），点击通视分析按钮进行通视分析。
            <br />绿色为通视区域，绿色为可通视区域（由视域点向目标点观察）
          </div>
        </div>
      </el-card>
      <!-- 可视域分析面板 -->
      <el-card class="box-card" id="viewshedAnalysisPanel">
        <div>
          <div>
            <div style="text-align: center; margin-top: 10px">
              <p style="margin-left: 0px; width: 150px">水平视角(单位:度)：</p>
              <el-slider size="mini" @change="startViewshedAnalysis" v-model="verticalViewAngle" :max="maxVerticalViewAngle" style="width: 100px"></el-slider>
              <p style="margin-left: 0px; width: 150px">垂直视角 (单位:度)：</p>
              <el-slider size="mini" @change="startViewshedAnalysis" v-model="horizontalViewAngle" :max="maxHorizontalViewAngle" style="width: 100px"></el-slider>
              <p style="margin-left: 0px; width: 150px">俯仰角 (单位:度)：</p>
              <el-slider size="mini" @change="startViewshedAnalysis" v-model="viewHeading" :max="maxViewHeading" style="width: 100px"></el-slider>
              <p style="margin-left: 0px; width: 150px">可视距离 (单位:米)：</p>
              <el-slider size="mini" @change="startViewshedAnalysis" v-model="viewDistance" :max="maxViewDistance" style="width: 100px"></el-slider>
              <el-button type="primary" size="mini" @click="addViewPoint">添加视点</el-button>
              <el-button type="primary" size="mini" @click="startViewshedAnalysis">可视域分析</el-button>
              <el-button type="primary" size="mini" @click="clearResults_k">清除</el-button>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 等高线渲染面板 -->
      <el-card class="box-card" id="contourRenderingPanel">
        <div style="margin-top: 10px">
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>背景透明度：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="backgroundTransparency" @change="AddContourLinesRender" :min="0.0" :max="1.0" :step="0.01" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>条带透明度：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="bandTransparency" @change="AddContourLinesRender" :min="0.0" :max="1.0" :step="0.01" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>条带宽度：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="bandThickness" @change="AddContourLinesRender" :min="10" :max="100" :step="1" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>条带1位置：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="band1Position" @change="AddContourLinesRender" :min="0" :max="8848" :step="1" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>条带2位置：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="band2Position" @change="AddContourLinesRender" :min="0" :max="8848" :step="1" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10" style="margin-top: 10px"><div>条带3位置：</div></el-col>
            <el-col :span="14">
              <el-slider size="mini" v-model="band3Position" @change="AddContourLinesRender" :min="0" :max="8848" :step="1" style="width: 100px"></el-slider>
            </el-col>
          </el-row>
          <el-checkbox v-model="gradient" @change="AddContourLinesRender"><div>梯度</div></el-checkbox>
          <el-row style="margin-top: 10px">
            <el-col :span="12"> <el-button type="primary" size="mini" @click="AddContourLines">等高线(默认)</el-button></el-col>
            <el-col :span="12">
              <el-button type="primary" size="mini" @click="AddContourLinesRender">等高线(渲染)</el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
      <!-- 剖面图面板 -->
      <el-card class="box-card" id="mainChart">
        <div id="mainChart"></div>
      </el-card>
      <!-- 开挖分析面板 -->
      <el-card class="box-card" id="topographicExcavationPanel">
        <div>
          <div>
            <p style="text-align: center">地形开挖（凸多边形）</p>
            <el-button type="primary" size="mini" @click="addUndergroundPipeline">添加地下管线</el-button>
            <el-button type="primary" size="mini" @click="drawPolygon">绘制开挖多边形</el-button>
            <el-button type="primary" size="mini" @click="excavation">地形开挖</el-button>
            底面高度：<el-input size="mini" v-model="base_Height" style="width: 100px"></el-input>
          </div>
        </div>
      </el-card>
      <!-- 地形挖填方分析面板 -->
      <el-card class="box-card" id="fillDigAnalysisPanel">
        <div>
          <div>
            <p style="text-align: center">地形挖填方分析</p>
            平整面高度：<el-input size="mini" v-model="flatSurface_Height" style="width: 100px"></el-input> 精度：<el-input size="mini" v-model="precision" style="width: 100px"></el-input>
            <el-button type="primary" size="mini" @click="DrawPolygon_two">绘制区域</el-button>
            <el-button type="primary" size="mini" @click="fillDigAnalysis">分析计算</el-button>
          </div>
        </div>
      </el-card>
      <!-- 地形挖填方信息面板 -->
      <el-card class="box-card" id="fillDigAnalysisResultPanel">
        <div>
          <div>
            <p style="text-align: center">地形开挖方分析结果</p>
            <div>
              <p style="text-align: center; font-size: 15px">填方体积：{{ fillDigAnalysisResult.fillVolume.toFixed(2) }}立方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">挖方体积：{{ fillDigAnalysisResult.cutVolume.toFixed(2) }}立方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">裁剪箱体积：{{ fillDigAnalysisResult.allVolume.toFixed(2) }}立方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">地形体积：{{ fillDigAnalysisResult.terrainVolume.toFixed(2) }}立方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">多边形总面积：{{ fillDigAnalysisResult.allArea.toFixed(2) }}平方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">填方部分面积：{{ fillDigAnalysisResult.fillArea.toFixed(2) }}平方米</p>
            </div>
            <div>
              <p style="text-align: center; font-size: 15px">挖方部分面积：{{ fillDigAnalysisResult.cutArea.toFixed(2) }}平方米</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <canvas id="ThreeContainer"></canvas>
    <div id="view2D"></div>
    <div id="credit"></div>
    <div id="eye"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      map: {},
      coord: '',
      clampToGround: true,
      measure: null,
      viewer: null,
      areajson: [],
      roadJson: [],
      waterData: [],
      props: { multiple: true },
      options: [
        {
          value: '各类数据加载',
          label: '各类数据加载',
          children: [
            {
              value: '加载天地图wmts服务',
              label: '加载天地图wmts服务'
            },
            {
              value: '加载XYZ瓦片服务',
              label: '加载XYZ瓦片服务'
            },
            {
              value: '加载geoserver的wms服务',
              label: '加载geoserver的wms服务'
            },
            {
              value: '加载3DTileset模型',
              label: '加载3DTileset模型'
            },
            {
              value: '加载geojson数据',
              label: '加载geojson数据'
            },
            {
              value: '加载json数据',
              label: '加载json数据'
            },
            {
              value: '加载kml数据',
              label: '加载kml数据'
            },
            {
              value: '加载czml数据',
              label: '加载czml数据'
            }
          ]
        },
        {
          value: '地图场景和场景效果',
          label: '地图场景和场景效果',
          children: [
            {
              value: '鹰眼图',
              label: '鹰眼图'
            },
            {
              value: '分屏',
              label: '分屏'
            },
            {
              value: '二三维联动',
              label: '二三维联动'
            },
            {
              value: '反选遮罩',
              label: '反选遮罩'
            },
            {
              value: '绕地旋转面板',
              label: '绕地旋转面板'
            },

            {
              value: '地球自转',
              label: '地球自转'
            },
            {
              value: '昼夜交替',
              label: '昼夜交替'
            },
            {
              value: '日照阴影模拟效果',
              label: '日照阴影模拟效果'
            },
            {
              value: '多彩矩形地球球体',
              label: '多彩矩形地球球体'
            },
            {
              value: '自定义球体背景',
              label: '自定义球体背景'
            },
            {
              value: '自定义天空盒',
              label: '自定义天空盒'
            },
            {
              value: '场景出图',
              label: '场景出图'
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
              label: '旋转实体'
            },
            {
              value: '道路流动线效果',
              label: '道路流动线效果'
            },
            {
              value: '道路闪烁线效果',
              label: '道路闪烁线效果'
            },
            {
              value: '竖直飞线效果',
              label: '竖直飞线效果'
            },
            {
              value: '抛物流动飞线效果',
              label: '抛物流动飞线效果'
            },
            {
              value: '面状要素的立体拉伸效果',
              label: '面状要素的立体拉伸效果'
            },
            {
              value: '六边形扩散效果',
              label: '六边形扩散效果'
            },
            {
              value: '动态流动水面',
              label: '动态流动水面'
            },
            {
              value: '加载Polygon绘制墙',
              label: '加载Polygon绘制墙'
            },
            {
              value: '动态立体墙效果',
              label: '动态立体墙效果'
            },
            {
              value: '动态流动墙体效果',
              label: '动态流动墙体效果'
            },
            {
              value: '动态扩散墙效果',
              label: '动态扩散墙效果'
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
      ],
      isCollapse: true,
      value: '',
      base_Height: 200, //底面高度
      initialWater_Height: 200, //初始水面高度
      maxWater_Height: 1000, //最大水面高度
      submerge_Speed: 1, //淹没速度
      verticalViewAngle: 60, //垂直视角
      maxVerticalViewAngle: 360, //最大垂直视角
      horizontalViewAngle: 90, //水平视角
      maxHorizontalViewAngle: 360, //最大水平视角
      viewHeading: 0, //视角方位角
      maxViewHeading: 360, //最大视角方位角
      viewDistance: 500, //视距
      maxViewDistance: 10000, //最大视距
      backgroundTransparency: 0.75, //背景透明度
      bandTransparency: 0.5, //带状透明度
      bandThickness: 2.0, //带状厚度
      band1Position: 700.0, //带状1位置
      band2Position: 1000.0, //带状2位置
      band3Position: 2000.0, //带状3位置
      gradient: false, //是否开启梯度
      flatSurface_Height: 400, //平面高度
      precision: 256, //精度
      allPoints: [], //多边形点集合
      fillDigAnalysisResult: {
        fillVolume: 0,
        cutVolume: 0,
        fillArea: 0,
        cutArea: 0,
        allVolume: 0,
        allArea: 0,
        terrainVolume: 0
      },
      tabsValue: 'removeDraws',
      tabsValue_query: 'tapQuery',
      clickQueryResult: {
        name: '',
        id_0: '',
        type: ''
      },
      value_Conditions: [], //查询条件
      options_Conditions: [] //查询条件选项
    };
  },
  components: {},
  created() {},
  mounted() {
    // 初始化地球
    this.$nextTick(() => {
      this.$cesiumEarth.initEarth(this.$refs.cesiumContainer);
      var viewer = this.$cesiumEarth.viewer;
      var _this = this;
      //地图监听
      _this.handler_pdh = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      let iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
      iframe.setAttribute('src', ''); //必须设置src为空 否则不会生效
      //监听鼠标左键单击事件
      _this.handler_pdh.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        if (pick != undefined && pick.id._data != null) {
          console.log(_this.$cesiumEarth.viewer);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });
    // 订阅
    this.$bus.$on('cesium-to-card', e => {
      if (e && e.name != undefined) {
        this.clickQueryResult = e;
      }
    });
    // 获取查询条件
    // this.getPropertyNames();
  },
  beforeDestroy() {
    this.$cesiumEarth.ClampToGround();
    // 销毁
    this.$bus.$off('cesium-to-card');
  },
  computed: {},
  methods: {
    // 选项改变时触发
    changeOptions(val) {
      this.value = [];
      this.value.push(val);
      // 选项为空时的处理
      if (this.value.length <= 0) {
        reset();
      }
      // 遍历
      for (let j = 0; j < this.value.length; j++) {
        //三维量测面板显示/隐藏
        if (this.value[j].includes('三维量测(measure)')) {
          document.getElementById('measurePanel').style.display = 'block';
        }
        //鼠标绘制面板显示/隐藏
        if (this.value[j].includes('鼠标绘制')) {
          document.getElementById('mouseDrawing').style.display = 'block';
        }
        //信息查询面板显示/隐藏
        if (this.value[j].includes('信息查询')) {
          document.getElementById('informationQuery').style.display = 'block';
        }
        //鹰眼图显示/隐藏
        if (this.value[j].includes('鹰眼图')) {
          document.getElementById('eye').style.display = 'block';
        }
        //绕地旋转面板显示/隐藏
        if (this.value[j].includes('绕地旋转面板')) {
          document.getElementById('rotatePanel').style.display = 'block';
        }
        //自定义球体背景显示/隐藏
        if (window.backImgIndex != '' && window.backImgIndex != null) {
          if (this.value[j].includes('自定义球体背景')) {
            this.$cesiumEarth.viewer.scene.imageryLayers.get(window.backImgIndex).show = true;
          }
        } else {
          this.$message({
            message: '请先添加自定义球体背景',
            type: 'warning'
          });
        }
        //多彩矩形地球球体显示/隐藏
        if (this.value[j].includes('多彩矩形地球球体')) {
          this.$cesiumEarth.InitColorfulRectEarth();
        }
        //下雪效果显示/隐藏
        if (this.value[j].includes('下雪天效果')) {
          this.$cesiumEarth.SnowEffect();
        }
        //下雨效果显示/隐藏
        if (this.value[j].includes('下雨天效果')) {
          this.$cesiumEarth.RainEffect();
        }
        //雾天效果显示/隐藏
        if (this.value[j].includes('雾天效果')) {
          this.$cesiumEarth.FogEffect();
        }
        // 地球自转
        if (this.value[j].includes('地球自转')) {
          this.$cesiumEarth.StartGlobeRotate();
        }
        // 昼夜交替
        if (this.value[j].includes('昼夜交替')) {
          this.$cesiumEarth.UpdateLighting();
        }
        if (this.value[j].includes('地球自转') || this.value[j].includes('昼夜交替')) {
          this.$cesiumEarth.viewer.clock.shouldAnimate = true;
        }
        // 分屏
        if (this.value[j].includes('分屏')) {
          // 设置分屏位置
          this.$cesiumEarth.Split();
        }
        //二三维联动
        if (this.value[j].includes('二三维联动')) {
          document.getElementById('view2D').style.display = 'inline-block';
        }
        // 反选遮罩
        // 数据来源：http://datav.aliyun.com/portal/school/atlas/area_selector#&lat=31.80289258670676&lng=104.32617187499999&zoom=4
        if (this.value[j].includes('反选遮罩')) {
          //获取行政区域json数据（泰山区）
          this.$axios
            .get('../../../static/Taishan_District.json')
            .then(res => {
              this.areajson = res.data.features[0].geometry.coordinates[0][0];
            })
            .then(() => {
              this.$cesiumEarth.Mask(this.areajson);
            });
        }
        // 自定义天空盒
        if (this.value[j].includes('自定义天空盒')) {
          this.$cesiumEarth.CustomSkyBox();
        }
        // 场景出图
        if (this.value[j].includes('场景出图')) {
          document.getElementById('outImg').style.display = 'block';
        }
        // 旋转实体
        if (this.value[j].includes('旋转实体')) {
          for (let i = 0; i < this.$cesiumEarth.viewer.entities.values.length; i++) {
            if (this.$cesiumEarth.viewer.entities.values[i].id == 'ellipseRotateTest') {
              this.$cesiumEarth.viewer.entities.remove(this.$cesiumEarth.viewer.entities.values[i]);
            }
          }
          this.$cesiumEarth.endRotate = false;
          let entityData = {
            name: '旋转椭圆',
            type: 'ellipse',
            id: 'ellipseRotateTest',
            position: '117.118611,36.193258',
            semiMinorAxis: 500.0,
            semiMajorAxis: 1000.0,
            material: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
            num: 1,
            rotate: true,
            rotateSpeed: 1
          };
          // 旋转椭圆
          let ellipseRotate = this.$cesiumEarth.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(117.118611, 36.193258),
            id: 'ellipseRotateTest',
            data: entityData,
            ellipse: {
              semiMinorAxis: 500.0,
              semiMajorAxis: 1000.0,
              material: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
            },
            description:
              '<div style="">' +
              '<table style="width:100%;text-align:center;overflow:auto;background-color: white;" border="5"><tbody>' +
              '<tr><td style="color:#131722;border:solid ">名称</td><td style="color:#131722;border:solid ">' +
              entityData.name +
              '</td></tr>' +
              '<tr><td style="color:#131722;border:solid ">类型</td><td style="color:#131722;border:solid ">' +
              entityData.type +
              '</td></tr>' +
              '<tr><td style="color:#131722;border:solid ">编号</td><td style="color:#131722;border:solid ">' +
              entityData.id +
              '</td></tr>' +
              '<tr><td style="color:#131722;border:solid ">经纬度</td><td style="color:#131722;border:solid ">' +
              entityData.position +
              '</td></tr>' +
              '</tbody></table></div>'
          });
          this.$cesiumEarth.RotateEntity(ellipseRotate.ellipse, 0, 1);
        }
        // 道路流动线效果
        // 数据来源:https://www.poi86.com/poi/amap/city/370100.html
        if (this.value[j].includes('道路流动线效果')) {
          // geojson数据路径
          let geojsonPath = '../static/geojson/泰山区道路.geojson';
          // 线颜色
          let polylineColor = '#00FFFF';
          // 线宽
          let polylineWidth = 1.7;
          // 持续时间（越小，则线运动越快）
          let duration = 2000;
          this.$cesiumEarth.RoadShuttle(geojsonPath, polylineColor, polylineWidth, duration);
        }
        // 道路闪烁线效果
        if (this.value[j].includes('道路闪烁线效果')) {
          this.$cesiumEarth.RoadFlashing();
        }
        // 既没有道路流动线又没有道路闪烁线
        if (!(this.value[j].includes('道路流动线效果') || this.value[j].includes('道路闪烁线效果') || this.value[j].includes('面状要素的立体拉伸效果'))) {
          if (this.$cesiumEarth.viewer.dataSources.length > 0) {
            this.$cesiumEarth.viewer.dataSources.removeAll();
          }
        }
        this.$cesiumEarth.measure = new Cesium.Measure(this.$cesiumEarth.viewer);
        // 竖直飞线效果
        if (this.value[j].includes('竖直飞线效果')) {
          let list = [];
          let position = [117.123076, 36.214848];
          let num = 120;
          for (let i = 0; i < num; i++) {
            // random产生的随机数范围是0-1，需要加上正负模拟
            let lon = position[0] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
            let lat = position[1] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
            list.push([lon, lat]);
          }
          this.$cesiumEarth.LineFlowInit(list);
        }
        // 抛物流动飞线效果
        if (this.value[j].includes('抛物流动飞线效果')) {
          let center = [117.123076, 36.214848];
          let num = 20;
          this.$cesiumEarth.ParabolaFlowInit(center, num);
        }
        // 面状要素的立体拉伸效果
        if (this.value[j].includes('面状要素的立体拉伸效果')) {
          this.$cesiumEarth.SurfaceElementStretching();
        }
        // 六边形扩散效果
        if (this.value[j].includes('六边形扩散效果')) {
          let position = [117.141411, 36.199445, 0];
          let color = '#0099BF';
          this.$cesiumEarth.HexagonDiffusion(position, color);
        }
        // 动态流动水面
        if (this.value[j].includes('动态流动水面')) {
          // 获取水域数据（黄前水库）
          this.$axios
            .get('../../../static/geojson/岱岳区水域.geojson')
            .then(res => {
              let list = res.data.features[200].geometry.coordinates[0][0];
              for (let i = 0; i < list.length; i++) {
                this.waterData.push(list[i][0]);
                this.waterData.push(list[i][1]);
              }
            })
            .then(() => {
              this.$cesiumEarth.FlowingWaterSurface(this.waterData);
              let position = {
                lon: 117.233478,
                lat: 36.309579,
                height: 4000
              };
              this.$cesiumEarth.FlyTo(this.$cesiumEarth.viewer, position, 5);
            });
        }
        // 加载Polygon绘制墙
        if (this.value[j].includes('加载Polygon绘制墙')) {
          this.$axios.get('../../../static/geojson/岱岳区水域.geojson').then(res => {
            let array = [];
            let list = res.data.features[200].geometry.coordinates[0][0];
            for (let i = 0; i < list.length; i++) {
              array.push(list[i][0]);
              array.push(list[i][1]);
            }
            this.$cesiumEarth.DrawWall(array);
            let position = {
              lon: 117.233478,
              lat: 36.309579,
              height: 4000
            };
            this.$cesiumEarth.FlyTo(this.$cesiumEarth.viewer, position, 5);
          });
        }
        // 动态立体墙效果
        if (this.value[j].includes('动态立体墙效果')) {
          this.$axios.get('../../../static/geojson/岱岳区水域.geojson').then(res => {
            let array = [];
            let list = res.data.features[200].geometry.coordinates[0][0];
            for (let i = 0; i < list.length; i++) {
              array.push(list[i][0]);
              array.push(list[i][1]);
            }
            this.$cesiumEarth.DynamicWall(array);
            let position = {
              lon: 117.233478,
              lat: 36.309579,
              height: 4000
            };
            this.$cesiumEarth.FlyTo(this.$cesiumEarth.viewer, position, 5);
          });
        } else {
          for (let i = 0; i < this.$cesiumEarth.viewer.entities.values.length; i++) {
            if (this.$cesiumEarth.viewer.entities.values[i].id == 'dynamicWall') {
              this.$cesiumEarth.viewer.entities.remove(this.$cesiumEarth.viewer.entities.values[i]);
            }
          }
        }
        // 动态流动墙体效果
        if (this.value[j].includes('动态流动墙体效果')) {
          this.$axios.get('../../../static/geojson/财源街道边界.geojson').then(res => {
            let array = [];
            let list = res.data.features[0].geometry.coordinates[0][0];
            for (let i = 0; i < list.length; i++) {
              array.push(list[i][0]);
              array.push(list[i][1]);
            }
            this.$cesiumEarth.FlowWall(array);
          });
        }
        // 动态扩散墙效果
        if (this.value[j].includes('动态扩散墙效果')) {
          this.$axios.get('../../../static/geojson/财源街道边界.geojson').then(res => {
            let list = res.data.features[0].geometry.coordinates[0];
            this.$cesiumEarth.DiffusionWall(list, 2.0, 1000.0, new Cesium.Color(1.0, 1.0, 0.0, 0.7));
          });
        }
        // 正多边形扩散墙效果
        if (this.value[j].includes('正多边形扩散墙效果')) {
          let options = {
            center: [117.141411, 36.199445],
            radius: 1000.0,
            edge: 5,
            height: 600.0,
            speed: 15.0,
            minRadius: 50
          };
          this.$cesiumEarth.RegularPolygonDiffusionWall(options);
        }
        // 立体墙（垂直、水平）渐变泛光效果
        if (this.value[j].includes('立体墙（垂直、水平）渐变泛光效果')) {
          this.$axios.get('../../../static/geojson/财源街道边界.geojson').then(res => {
            let array = [];
            let list = res.data.features[0].geometry.coordinates[0][0];
            for (let i = 0; i < list.length; i++) {
              array.push(list[i][0]);
              array.push(list[i][1]);
            }
            this.$cesiumEarth.GradientFloodWall(array);
          });
        }
        // 旋转圆
        if (this.value[j].includes('旋转圆')) {
          this.$cesiumEarth.RotateCircle(117.141411, 36.19);
        }
        // 扫描圆
        if (this.value[j].includes('扫描圆')) {
          this.$cesiumEarth.ScanningCircle(117.141411, 36.19);
        }
        // 波纹圆
        if (this.value[j].includes('波纹圆')) {
          this.$cesiumEarth.WavyCircle(117.141411, 36.19);
        }
        // 扩散圆
        if (this.value[j].includes('扩散圆')) {
          this.$cesiumEarth.DiffusionCircle(117.141411, 36.19);
        }
        // 消隐圆
        if (this.value[j].includes('消隐圆')) {
          this.$cesiumEarth.BlankingCircle(117.141411, 36.19);
        }
        // 模糊圆
        if (this.value[j].includes('模糊圆')) {
          this.$cesiumEarth.FuzzyCircle(117.141411, 36.19);
        }
        // 螺旋圆
        if (this.value[j].includes('螺旋圆')) {
          this.$cesiumEarth.SpiralCircle(117.141411, 36.19);
        }
        // 多彩圆
        if (this.value[j].includes('多彩圆')) {
          this.$cesiumEarth.MulticoloredCircle(117.141411, 36.19);
        } else {
          for (let i = 0; i < this.$cesiumEarth.viewer.entities.values.length; i++) {
            if (this.$cesiumEarth.viewer.entities.values[i].id == 'colorfulCircle') {
              this.$cesiumEarth.viewer.entities.remove(this.$cesiumEarth.viewer.entities.values[i]);
            }
          }
        }
        // 脉冲圆
        if (this.value[j].includes('脉冲圆')) {
          this.$cesiumEarth.PulseCircle(117.141411, 36.19);
        }
        // 水波纹扩散效果
        if (this.value[j].includes('水波纹扩散效果')) {
          this.$cesiumEarth.WaterRippleDiffusion(117.141411, 36.19);
        }
        // 圆扩散效果
        if (this.value[j].includes('圆扩散效果')) {
          this.$cesiumEarth.CircularDiffusion(117.141411, 36.19, 0);
        }
        // 线圈发光效果
        if (this.value[j].includes('线圈发光效果')) {
          this.$cesiumEarth.CoilLuminescence(117.141411, 36.19, 0);
        }
        // 雷达平扫效果
        if (this.value[j].includes('雷达平扫效果')) {
          this.$cesiumEarth.RadarSweep(117.141411, 36.19, 0);
        }
        // 雷达线效果
        if (this.value[j].includes('雷达线效果')) {
          this.$cesiumEarth.RadarLine(117.141411, 36.19);
        }
        // 波纹雷达效果
        if (this.value[j].includes('波纹雷达效果')) {
          this.$cesiumEarth.RippleRadar(117.141411, 36.19);
        }
        // 图片雷达效果
        if (this.value[j].includes('图片雷达效果')) {
          this.$cesiumEarth.PictureRadar(117.141411, 36.19);
        }
        // 雷达扫描效果2
        if (this.value[j].includes('雷达扫描效果2')) {
          this.$cesiumEarth.RadarScanning(117.141411, 36.19);
        }
        // 立体雷达扫描效果
        if (this.value[j].includes('立体雷达扫描效果')) {
          let options = {
            position: [117.141411, 36.19],
            radius: 1000.0,
            color: new Cesium.Color(1.0, 1.0, 0.0, 0.3),
            speed: 2.0
          };
          this.$cesiumEarth.StereoRadarScanning(options);
        }
        // 轨迹球体效果
        if (this.value[j].includes('轨迹球体效果')) {
          this.$cesiumEarth.TrajectorySphere(117.141411, 36.19);
        }
        // 电弧球体效果
        if (this.value[j].includes('电弧球体效果')) {
          this.$cesiumEarth.ArcSphere(117.141411, 36.19);
        }
        // 广告牌效果
        if (this.value[j].includes('广告牌效果')) {
          this.$cesiumEarth.Billboard(117.102442, 36.185321, '泰山火车站', 'blue');
        }
        // 3D Tiles(建筑物渐变和动态光环)
        if (this.value[j].includes('3D Tiles(建筑物渐变和动态光环)')) {
          this.$cesiumEarth.AddCesium3DTileset2(true);
        }
        // glb模型(键盘控制模型姿态)
        if (this.value[j].includes('glb模型(键盘控制模型姿态)')) {
          window.fly = true;
          this.$cesiumEarth.AddCesiumglb(117.102442, 36.185321, 4000);
        }
        // glb模型(轨迹移动)
        if (this.value[j].includes('glb模型(轨迹移动)')) {
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style.display = 'inline-block';
          document.getElementsByClassName('cesium-viewer-timelineContainer')[0].style.display = 'inline-block';
          var ponitList = [
            {
              x: 117.102442,
              y: 36.185321,
              z: 0
            },
            {
              x: 117.202442,
              y: 36.185321,
              z: 0
            },
            {
              x: 117.202442,
              y: 36.195321,
              z: 0
            }
          ];
          this.$cesiumEarth.TrajectoryMovement(ponitList);
        }
        // 点聚合
        if (this.value[j].includes('点聚合')) {
          let pointArray = [];
          for (let i = 0; i < 2000; i++) {
            let x = 117.102442 + Math.random() * 0.1;
            let y = 36.185321 + Math.random() * 0.1;
            pointArray.push([x, y]);
          }
          this.$cesiumEarth.PointClustering(pointArray);
        }
        // 粒子特效
        if (this.value[j].includes('粒子特效')) {
          this.$cesiumEarth.ParticleEffect(117.102442, 36.185321, '水枪');
          let position = {
            lon: 117.102442,
            lat: 36.185321,
            height: 1000
          };
          this.$cesiumEarth.FlyTo(this.$cesiumEarth.viewer, position, 5);
        }
        // 空间分析-淹没分析
        if (this.value[j].includes('淹没分析')) {
          document.getElementById('induationAnalysisPanel').style.display = 'block';
        }
        // 日照阴影模拟效果
        if (this.value[j].includes('日照阴影模拟效果')) {
          // 加载模型
          this.$cesiumEarth.AddCesium3DTileset2(false);
          // 开启光照
          this.$cesiumEarth.SunShadows(1500);
        }
        // 空间分析-通视分析
        if (this.value[j].includes('通视分析')) {
          document.getElementById('visibilityAnalysisPanel').style.display = 'block';
        }
        // 空间分析-可视域分析
        if (this.value[j].includes('可视域分析')) {
          // 加载模型
          this.$cesiumEarth.AddCesium3DTileset2(false);
          document.getElementById('viewshedAnalysisPanel').style.display = 'block';
        }
        // 等高线
        if (this.value[j].includes('等高线')) {
          document.getElementById('contourRenderingPanel').style.display = 'block';
        }
        // 空间分析-剖面分析
        if (this.value[j].includes('剖面分析')) {
          this.$cesiumEarth.ProfileAnalysis();
        }
        // 空间分析-地形开挖
        if (this.value[j].includes('地形开挖')) {
          document.getElementById('topographicExcavationPanel').style.display = 'block';
          // 地形透明（方便查找要开挖的区域）
          var viewer = this.$cesiumEarth.viewer;
          var globe = viewer.scene.globe;
          globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(400.0, 0.0, 800.0, 1.0);
          globe.translucency.enabled = true;
          var alpha = 0.2;
          alpha = Cesium.Math.clamp(alpha, 0.0, 1.0);
          globe.translucency.frontFaceAlphaByDistance.nearValue = alpha;
          globe.translucency.frontFaceAlphaByDistance.farValue = true ? 1.0 : alpha;

          let position = {
            lon: 117.145668,
            lat: 36.2198067,
            height: 800
          };
          this.$cesiumEarth.FlyTo(this.$cesiumEarth.viewer, position, 5);
        }
        // 空间分析-地形填挖
        if (this.value[j].includes('填挖方计算')) {
          document.getElementById('fillDigAnalysisPanel').style.display = 'block';
        }
        // 空间分析-热力图
        if (this.value[j].includes('热力图') && !this.value[j].includes('立体热力图')) {
          // 热力图点数据
          let pointArray = [];
          for (let i = 0; i < 100; i++) {
            let x = 117.102442 + Math.random() * 0.1;
            let y = 36.185321 + Math.random() * 0.1;
            pointArray.push({
              longitude: x,
              latitude: y,
              count: Math.random() * 100
            });
          }
          // 热力图区域
          var region = [
            { longitude: 117.202442, latitude: 36.285321 },
            { longitude: 117.202442, latitude: 36.085321 },
            { longitude: 117.102442, latitude: 36.085321 },
            { longitude: 117.102442, latitude: 36.285321 }
          ];

          // 热力图参数
          var heatmapParameter = {
            backgroundColor: 'rgba(0,0,0,0)', // 背景色
            radius: 80, // 半径
            maxOpacity: 0.5, // 最大透明度
            minOpacity: 0, // 最小透明度
            blur: 0.85 // 模糊度
          };
          this.$cesiumEarth.ThermalMap(pointArray, region, heatmapParameter);
        }
        // 空间分析-立体热力图
        if (this.value[j].includes('立体热力图')) {
          // 热力图点数据
          let pointArray_3D = [];
          let setCameraView_3D = {
            x: 117.102442,
            y: 36.185321,
            z: 12222.804219526453,
            heading: 354.6893925320491,
            pitch: -16.957477434957926,
            roll: 0.13837382238243223,
            duration: 0
          };
          for (let i = 0; i < 100; i++) {
            pointArray_3D.push({
              lnglat: [117.102442 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1), 36.185321 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1)],
              value: 1000 * Math.random()
            });
          }
          this.$cesiumEarth.ThermalMap_3D(pointArray_3D, setCameraView_3D);
        }
        // 空间分析-地形三角网
        if (this.value[j].includes('地形三角网')) {
          this.$message({
            message: '鼠标左键点击绘制矩形区域，移动鼠标变化区域范围，鼠标双击结束绘制',
            type: 'warning'
          });
          //鼠标绘制矩形
          this.$cesiumEarth.DrawRectangle().then(res => {
            //生成三角网
            // res:矩形区域
            // 30:三角网横向和纵向的点数（值越大，越详细，加载越慢）
            // 100:三角网面提升的高度
            this.$cesiumEarth.GeneratingTriangulation(res, 30, 500);
          });
        }
        // 空间分析-坡度坡向分析
        // if (this.value[j].includes("坡度坡向分析")) {
        //   this.$cesiumEarth.Slope_Aspect_Analysis();
        // }
        if (this.value[j].includes('threejs+cesium')) {
          document.getElementById('cesiumContainer').style.position = 'absolute';
          this.$cesiumEarth.createThree(this.$refs.cesiumContainer);
        }
        if (this.value[j].includes('加载天地图wmts服务')) {
          this.$cesiumEarth.AddTiandituWmts(['矢量底图', '矢量注记']);
        }
        if (this.value[j].includes('加载XYZ瓦片服务')) {
          this.$cesiumEarth.AddXyz();
        }
        if (this.value[j].includes('加载geoserver的wms服务')) {
          this.$cesiumEarth.AddGeoserverService();
        }
        if (this.value[j].includes('加载3DTileset模型')) {
          this.$cesiumEarth.Add3DTileset();
        }

        if (this.value[j].includes('加载geojson数据')) {
          this.$cesiumEarth.AddGuGong();
        }
        if (this.value[j].includes('加载geojson数据')) {
          this.$cesiumEarth.AddGuGong();
        }
        if (this.value[j].includes('加载json数据')) {
          this.$cesiumEarth.AddJson();
        }
        if (this.value[j].includes('加载kml数据')) {
          this.$cesiumEarth.AddKml();
        }
        if (this.value[j].includes('加载czml数据')) {
          his.$cesiumEarth.AddCzml();
        }
        if (this.value[j].includes('Echarts-饼图')) {
          this.$cesiumEarth.PieEcharts();
        }
        if (this.value[j].includes('Echarts-散点图')) {
          this.$cesiumEarth.ScatterEcharts();
        }
        if (this.value[j].includes('Echarts-飞行路线图')) {
          this.$cesiumEarth.FlyEcharts();
        }
        if (this.value[j].includes('Echarts-流入图')) {
          this.value[j].includes('Echarts-流入图');
        }
        if (this.value[j].includes('Echarts-基础柱状图')) {
          this.$cesiumEarth.BarEcharts();
        }
        if (this.value[j].includes('Echarts-光柱柱状图')) {
          this.$cesiumEarth.BarEcharts2();
        }
      }
    },
    // 重置
    reset() {
      //三维量测面板隐藏
      document.getElementById('measurePanel').style.display = 'none';
      //鼠标绘制面板隐藏
      document.getElementById('mouseDrawing').style.display = 'none';
      //鹰眼图隐藏
      document.getElementById('eye').style.display = 'none';
      //绕地旋转面板隐藏
      document.getElementById('rotatePanel').style.display = 'none';
      // 空间分析面板隐藏
      document.getElementById('induationAnalysisPanel').style.display = 'none';
      // 通视分析面板隐藏
      document.getElementById('visibilityAnalysisPanel').style.display = 'none';
      // 可视域分析面板隐藏
      document.getElementById('viewshedAnalysisPanel').style.display = 'none';
      // 场景出图隐藏
      document.getElementById('outImg').style.display = 'none';
      // 地形开挖隐藏
      document.getElementById('topographicExcavationPanel').style.display = 'none';
      // 地形填挖隐藏
      document.getElementById('fillDigAnalysisPanel').style.display = 'none';
      // 地形填挖结果隐藏
      document.getElementById('fillDigAnalysisResultPanel').style.display = 'none';
      // 等高线面板隐藏
      document.getElementById('contourRenderingPanel').style.display = 'none';
      //自定义球体背景隐藏
      this.$cesiumEarth.viewer.scene.imageryLayers.get(window.backImgIndex).show = false;
      //球体背景初始化（等高线什么的）
      this.$cesiumEarth.viewer.scene.globe.material = null;
      //多彩矩形地球球体隐藏
      if (this.$cesiumEarth.react != null) {
        this.$cesiumEarth.react.destroy();
      }
      //下雪天效果隐藏
      if (this.$cesiumEarth.snowStage) {
        var postProcessStages = this.$cesiumEarth.viewer.scene.postProcessStages;
        for (var i = 0; i < postProcessStages._stages.length; i++) {
          var stage = postProcessStages._stages[i];
          if (stage && stage._name === 'czm_snow') {
            this.$cesiumEarth.viewer.scene.postProcessStages.remove(stage);
          }
        }
      }
      //下雨天效果隐藏
      if (this.$cesiumEarth.rainStage) {
        var postProcessStages = this.$cesiumEarth.viewer.scene.postProcessStages;
        for (var i = 0; i < postProcessStages._stages.length; i++) {
          var stage = postProcessStages._stages[i];
          if (stage && stage._name === 'czm_rain') {
            this.$cesiumEarth.viewer.scene.postProcessStages.remove(stage);
          }
        }
      }
      //雾天效果隐藏
      if (this.$cesiumEarth.fogStage) {
        var postProcessStages = this.$cesiumEarth.viewer.scene.postProcessStages;
        for (var i = 0; i < postProcessStages._stages.length; i++) {
          var stage = postProcessStages._stages[i];
          if (stage && stage._name === 'czm_fog') {
            this.$cesiumEarth.viewer.scene.postProcessStages.remove(stage);
          }
        }
      }
      //地球自转隐藏
      this.$cesiumEarth.StopGlobeRotate();
      //昼夜交替隐藏
      this.$cesiumEarth.viewer.clock.shouldAnimate = false;
      this.$cesiumEarth.viewer.scene.globe.enableLighting = false;
      this.$cesiumEarth.viewer.shadows = false;
      this.$cesiumEarth.viewer.clock.shouldAnimate = false;
      //分屏隐藏
      this.$cesiumEarth.viewer.scene.splitPosition = 1.0;
      //二三维联动隐藏
      document.getElementById('view2D').style.display = 'none';
      //自定义天空盒隐藏
      let viewer = this.$cesiumEarth.viewer;
      viewer.scene.skyBox = this.$cesiumEarth.defaultSkyBox;
      viewer.scene.skyAtmosphere.show = true;
      //自定义地形隐藏
      if (this.$cesiumEarth.viewer.scene.globe.clippingPlanes != undefined) {
        this.$cesiumEarth.viewer.scene.globe.clippingPlanes.destroy();
      }
      // 清除geojson数据
      this.$cesiumEarth.measure._drawLayer.entities.removeAll();
      this.$cesiumEarth.viewer.dataSources.removeAll();
      this.$cesiumEarth.measure = new Cesium.Measure(this.$cesiumEarth.viewer);
      // 清除实体
      this.$cesiumEarth.viewer.entities.removeAll();
      // 清除groundPrimitives
      for (let i = 0; i < this.$cesiumEarth.viewer.scene.groundPrimitives._primitives.length; i++) {
        if (i > 0) {
          this.$cesiumEarth.viewer.scene.groundPrimitives._primitives[i].destroy();
        }
      }
      // 清除Primitive
      for (let i = 0; i < this.$cesiumEarth.viewer.scene.primitives._primitives.length; i++) {
        if (i > 0) {
          this.$cesiumEarth.viewer.scene.primitives._primitives[i].destroy();
        }
      }
      this.$cesiumEarth.clearAllLastStage();
      // 隐藏图表
      document.getElementById('mainChart').style.display = 'none';
      // 飞行
      window.fly = false;
      // 隐藏时间轴
      document.getElementsByClassName('cesium-viewer-animationContainer')[0].style.display = 'none';
      document.getElementsByClassName('cesium-viewer-timelineContainer')[0].style.display = 'none';
      this.clearResults_k();
    },
    // 测量面板功能
    // 是否贴地
    ClampToGround() {
      this.$cesiumEarth.ClampToGround();
    },
    // 空间距离
    SpaceDistance() {
      this.$cesiumEarth.SpaceDistance();
    },
    // 空间面积
    SpaceArea() {
      this.$cesiumEarth.SpaceArea();
    },
    // 鼠标绘制类型切换
    drawHandleClick() {
      let value = this.tabsValue;
      switch (value) {
        case 'drawPoint':
          this.$message({
            message: '开始绘制点',
            type: 'warning'
          });
          this.$cesiumEarth.DrawPoints();
          break;
        case 'drawPolyline':
          this.$message({
            message: '开始绘制线',
            type: 'warning'
          });
          this.$cesiumEarth.DrawPolyline();
          break;
        case 'drawCircle':
          this.$message({
            message: '开始绘制圆',
            type: 'warning'
          });
          this.$cesiumEarth.DrawCircle();
          break;
        case 'drawRectangle':
          this.$message({
            message: '开始绘制矩形',
            type: 'warning'
          });
          this.$cesiumEarth.DrawRectangle();
          break;
        case 'drawPolygon':
          this.$message({
            message: '开始绘制多边形',
            type: 'warning'
          });
          let option = {
            ground: false
          };
          this.$cesiumEarth.DrawPolygon_two(option);
          break;
        case 'removeDraws':
          this.$message({
            message: '清除绘制',
            type: 'warning'
          });
          this.$cesiumEarth.viewer.entities.removeAll();
          break;
      }
    },
    AddWMS() {
      this.$cesiumEarth.AddGeoserverService();
    },
    // 条件查询
    propertyQuery() {
      console.log(this.value_Conditions);
      this.$cesiumEarth.AddGeoserverService(this.value_Conditions);
    },
    // 获取条件查询需要的过滤条件值
    getPropertyNames() {
      // 图层名
      const layerConfigs = [
        {
          layers: 'sanmap:州界面'
        },
        {
          layers: 'sanmap:河流湖泊面'
        },
        {
          layers: 'sanmap:郡界线'
        },
        {
          layers: 'sanmap:河流线'
        },
        {
          layers: 'sanmap:郡治点'
        }
      ];
      // 服务地址
      const url = 'http://略略:8080/geoserver/sanmap/';
      // 待获取属性名
      const propertyname = 'Name_1';
      // 获取所有属性值
      fetch(`${url}ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerConfigs[0]['layers']}&propertyname=${propertyname}&outputFormat=application/json`)
        .then(response => response.json())
        .then(data => {
          // 从返回的GeoJSON数据中提取name属性值
          const names = data.features.map(feature => feature.properties.Name_1);
          // 为了获取不重复的name值，使用Set结构
          const uniqueNames = [...new Set(names)];
          // 将uniqueNames转化为你需要的options格式
          this.options_Conditions = uniqueNames.map(name => {
            return {
              label: name,
              value: name
            };
          });
        })
        .catch(error => console.error('获取name值失败！', error));
    },
    // 查询切换
    queryHandleClick() {},
    // 三角量测
    Triangulation() {
      this.$cesiumEarth.Triangulation();
    },
    // 清除量测
    ClearanceMeasurement() {
      this.$cesiumEarth.ClearanceMeasurement();
    },
    // 导出图片
    saveToImage() {
      this.$cesiumEarth.SaveToImage();
    },
    // 开始绕地旋转
    startRotate() {
      this.$cesiumEarth.StartRotate();
    },
    // 停止绕地旋转
    endRotate() {
      this.$cesiumEarth.StopRotate();
    },
    // 开始淹没分析
    startInduationAnalysis() {
      this.clearInduationAnalysis();
      // 默认区域（若未绘制区域）
      var dataList = [117.199818, 36.348001, 117.199818, 36.206481, 116.976176, 36.206481, 116.976176, 36.348001];
      this.$cesiumEarth.InduationAnalysis(dataList, this.initialWater_Height, this.maxWater_Height, this.submerge_Speed);
    },
    // 清除淹没分析
    clearInduationAnalysis() {
      for (let i = 0; i < this.$cesiumEarth.viewer.entities.values.length; i++) {
        if (this.$cesiumEarth.viewer.entities.values[i].id == 'induationAnalysis') {
          this.$cesiumEarth.viewer.entities.remove(this.$cesiumEarth.viewer.entities.values[i]);
        }
      }
    },
    // 添加视域点
    addViewPoint() {
      this.$cesiumEarth.AddViewPoint();
    },
    // 添加目标点
    addTargetPoint() {
      this.$cesiumEarth.AddTargetPoint();
    },
    // 开始通视分析
    startVisibilityAnalysis() {
      this.$cesiumEarth.VisibilityAnalysis();
    },
    // 清除通视分析
    clearResults() {
      for (let i = 0; i < this.$cesiumEarth.viewer.entities.values.length; i++) {
        if (this.$cesiumEarth.viewer.entities.values[i].id == 'viewPoint' || this.$cesiumEarth.viewer.entities.values[i].id == 'targetPoint' || this.$cesiumEarth.viewer.entities.values[i].id == 'Line_Sight') {
          this.$cesiumEarth.viewer.entities.remove(this.$cesiumEarth.viewer.entities.values[i]);
        }
      }
    },
    // 开始可视域分析
    startViewshedAnalysis() {
      new Promise((resolve, reject) => {
        this.clearResults_k();
        resolve();
      }).then(() => {
        // 可视域分析
        this.$cesiumEarth.ViewshedAnalysis(this.verticalViewAngle, this.horizontalViewAngle, this.viewHeading, this.viewDistance);
      });
    },
    // 清除可视域分析
    clearResults_k() {
      this.$cesiumEarth.clearHelsing();
    },
    // 添加等高线（默认）
    AddContourLines() {
      this.$cesiumEarth.viewer.scene.globe.material = null;
      this.$cesiumEarth.AddContourLines();
    },
    // 添加等高线（渲染）
    AddContourLinesRender() {
      this.$cesiumEarth.viewer.scene.globe.material = null;
      var viewModel = {
        gradient: this.gradient,
        band1Position: this.band1Position,
        band2Position: this.band2Position,
        band3Position: this.band3Position,
        bandThickness: this.bandThickness,
        bandTransparency: this.bandTransparency,
        backgroundTransparency: this.backgroundTransparency
      };
      this.$cesiumEarth.AddContourLinesRender(viewModel);
    },
    // 添加地下管线（地形开挖使用）
    addUndergroundPipeline() {
      // 添加三维管道
      // 垂直管道
      this.$cesiumEarth.VerticalPipe('node-A', [117.145668, 36.2198067], 200, null, null, 0.8);
      this.$cesiumEarth.VerticalPipe('node-B', [117.1459503, 36.2184511], 200, null, null, 0.8);
      // 水平管道
      this.$cesiumEarth.HorizontalPipe('link', [117.145668, 36.2198067, 200, 117.1457386, 36.2197631, 200, 117.1458055, 36.2197096, 200, 117.1458516, 36.2196686, 200, 117.1459059, 36.2196069, 200, 117.1459503, 36.2184511, 200], 'both', 2, 1);
    },
    // 绘制多边形
    drawPolygon() {
      if (this.$cesiumEarth.viewer.scene.globe.clippingPlanes != undefined) {
        this.$cesiumEarth.viewer.scene.globe.clippingPlanes.destroy();
        // this.$cesiumEarth.viewer.entities.removeAll();
      }
      this.$cesiumEarth.draw();
    },
    // 地形开挖
    excavation() {
      // 地形不透明
      var globe = this.$cesiumEarth.viewer.scene.globe;
      globe.translucency.enabled = true;
      var alpha = 1;
      alpha = Cesium.Math.clamp(alpha, 0.0, 1.0);
      globe.translucency.frontFaceAlphaByDistance.nearValue = alpha;
      globe.translucency.frontFaceAlphaByDistance.farValue = alpha;
      // 开挖
      this.$cesiumEarth.clippings(this.base_Height);
    },
    // 绘制多边形
    DrawPolygon_two() {
      // this.$cesiumEarth.test()
      //true:不贴地/false:贴地
      let option = {
        ground: false
      };
      this.$cesiumEarth.DrawPolygon_two(option).then(allPoints => {
        // 在这里，allPoints是结束绘制后的点坐标数组
        this.allPoints = allPoints;
      });
    },
    // 地形填挖计算
    fillDigAnalysis() {
      let viewer = this.$cesiumEarth.viewer;
      var entity1 = viewer.entities.getById('FillDigAnalysis');
      if (entity1) {
        viewer.entities.remove(entity1);
      }
      var result = this.$cesiumEarth.FillDigAnalysis(this.allPoints, this.flatSurface_Height, this.precision);
      // 地形体积等于裁剪箱体积减去填充体积加上开挖体积
      result.terrainVolume = result.allVolume - result.fillVolume + result.cutVolume;
      this.fillDigAnalysisResult = result;
      document.getElementById('fillDigAnalysisResultPanel').style.display = 'block';
    }
  }
};
</script>
<style scoped>
.home {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
#cesiumContainer {
  display: flex;

  height: 100%;
  width: 100%;
  z-index: 1;
}
#ThreeContainer {
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0%;
  z-index: 10;
  pointer-events: none;
}

#view3D {
  display: block;
  width: 100%;
}
#view2D {
  display: none;
  height: 100%;
  width: 100%;
}
#header {
  position: absolute;
  top: 0%;
  height: 50px;
  width: 100%;
  z-index: 100;
  background-color: #0a213f;
  color: #ffff;
}
#menu {
  position: absolute;
  top: 50px;
  overflow-y: auto;
  overflow-x: hidden;
  bottom: 0px;
  width: 200px;
  z-index: 100;
  background-color: #2d5e9c;
  color: #ffff;
}
/* 功能面板 */
#functionPanel {
  position: absolute;
  top: 40%;
  left: 1%;
  z-index: 100;
  width: 300px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.5);
}
#outImg {
  top: 10%;
  left: 18%;
  z-index: 100;
  display: none;
  position: absolute;
}
#reset {
  top: 10%;
  left: 18%;
  z-index: 100;
  display: block;
  position: absolute;
}
/* 三维量测面板样式 */
#measurePanel {
  position: absolute;
  display: none;
  top: 6%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 信息查询面板样式 */
#informationQuery {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 鼠标绘制面板样式 */
#mouseDrawing {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
.el-tab-pane {
  width: 350px; /* 根据需要设置适当的宽度 */
  word-wrap: break-word; /* 允许在单词边界换行 */
}
/* 绕地旋转面板 */
#rotatePanel {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
::v-deep .el-card__header {
  height: 0px;
  text-align: center;
  background: red;
}
/* 淹没分析面板*/
#induationAnalysisPanel {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 通视分析面板*/
#visibilityAnalysisPanel {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 可视域分析面板*/
#viewshedAnalysisPanel {
  position: absolute;
  display: none;
  top: 40%;
  right: 10px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 2%;
}
/* 等高线渲染面板*/
#contourRenderingPanel {
  position: absolute;
  display: none;
  top: 30%;
  right: 10px;
  width: 300px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 2%;
}
/* 剖面图显示面板*/
#mainChart {
  position: absolute;
  display: none;
  top: 33%;
  right: 10px;
  z-index: 100;
  width: 400px;
  height: 400px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 2%;
}
/* 地形开挖面板*/
#topographicExcavationPanel {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 填挖分析面板*/
#fillDigAnalysisPanel {
  position: absolute;
  display: none;
  top: 10%;
  left: 30%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2%;
}
/* 填挖分析结果面板*/
#fillDigAnalysisResultPanel {
  position: absolute;
  top: 40%;
  right: 10px;
  z-index: 100;
  width: 280px;
  height: 200px;
  display: none;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 2%;
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
  display: none;
  border: 2px solid #002fa7;
}
/* 屏幕分隔 */
#split {
  position: absolute;
  left: 50%;
  top: 5%;
  background-color: red;
  width: 3px;
  height: 90%;
}
</style>
