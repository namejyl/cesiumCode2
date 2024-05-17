/*
 * 态势标绘通用方法
 * @Author: Wang jianLei
 * @Date: 2023-01-16 15:00:35
 * @Last Modified by: jianlei wang
 * @Last Modified time: 2023-05-19 18:08:08
 */
import {
    calculateAngle,
    transformCartesianToWGS84,
    transformWGS84ToCartesian,
  } from './Coordinate';
  import xp from './algorithm';
  const Cesium = window.Cesium;
   
  interface x_y {
    x: any;
    y: any;
  }
   
  /**
   * 获取静态资源路径
   * @param url 路径
   * @returns
   */
  export const getAssetsData = (url: string) => {
    return new URL(`../assets/${url}`, import.meta.url).href;
  };
   
  /**
   * 创建随机（唯一）ID
   * @param num
   * @returns
   */
  const newSessionid = (num?: number) => {
    let len = num || 32;
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  };
  /**
   * 锁定视图
   * @param viewer - 三维场景
   * @param bool - 是否锁定
   */
  const lockingMap = (viewer: any, bool: boolean) => {
    // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
    viewer.scene.screenSpaceCameraController.enableRotate = bool;
    // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    viewer.scene.screenSpaceCameraController.enableTranslate = bool;
    // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    viewer.scene.screenSpaceCameraController.enableZoom = bool;
    // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
    viewer.scene.screenSpaceCameraController.enableTilt = bool;
  };
  /**
   * 创建贝塞尔点集
   * @param anchorpoints
   * @returns
   */
  const createBezierPoints = (anchorpoints: any[]) => {
    let degrees: any = [];
    for (let index = 0; index < anchorpoints.length; index++) {
      const degree = transformCartesianToWGS84(anchorpoints[index]);
      degrees.push(degree);
    }
    let numpoints = 100;
    let points: any = [];
    for (let i = 0; i <= numpoints; i++) {
      let point = computeBezierPoints(degrees, i / numpoints);
      const cartesian = transformWGS84ToCartesian(point);
      points.push(cartesian);
    }
    return points;
  };
  /**
   * 创建正多边形节点
   * @param centerPoint
   * @param endCartesian
   * @param num
   * @returns
   */
  const getRegularPoints = (centerPoint: any, endCartesian: any, num: number) => {
    const centerP = transformCartesianToWGS84(centerPoint);
    let distance = 1;
    if (endCartesian) {
      const endDegree = transformCartesianToWGS84(endCartesian);
      distance = Cesium.Cartesian3.distance(
        new Cesium.Cartesian3.fromDegrees(centerP.x, centerP.y, 0),
        new Cesium.Cartesian3.fromDegrees(endDegree.x, endDegree.y, 0)
      );
    }
    let ellipse = new Cesium.EllipseOutlineGeometry({
      center: centerPoint,
      semiMajorAxis: distance,
      semiMinorAxis: distance,
      granularity: 0.0001, //0~1 圆的弧度角,该值非常重要,默认值0.02,如果绘制性能下降，适当调高该值可以提高性能
    });
    let geometry = new Cesium.EllipseOutlineGeometry.createGeometry(ellipse);
    let circlePoints: any = [];
    let values = geometry.attributes.position.values;
    if (!values) return;
    let posNum = values.length / 3; //数组中以笛卡尔坐标进行存储(每3个值一个坐标)
    for (let i = 0; i < posNum; i++) {
      let curPos = new Cesium.Cartesian3(
        values[i * 3],
        values[i * 3 + 1],
        values[i * 3 + 2]
      );
      circlePoints.push(curPos);
    }
    let resultPoints: any = [];
    let pointsapart = Math.floor(circlePoints.length / num);
    for (let j = 0; j < num; j++) {
      resultPoints.push(circlePoints[j * pointsapart]);
    }
    return resultPoints;
  };
  /**
   * 创建攻击箭头节点
   * @param positions
   * @returns
   */
  const getAttackArrowPoints = (positions: any[]) => {
    let lnglatArr: any[] = [];
    for (let i = 0; i < positions.length; i++) {
      let lnglat = transformCartesianToWGS84(positions[i]);
      lnglatArr.push([lnglat.x, lnglat.y]);
    }
    let res = xp.algorithm.tailedAttackArrow(lnglatArr);
    let index = JSON.stringify(res.polygonalPoint).indexOf('null');
    let points = [];
    if (index == -1) points = res.polygonalPoint;
    return points;
  };
   
  /**
   * 创建直角箭头节点
   * @param anchorpoints
   * @returns
   */
  const getRightAngleArrowPoints = (anchorpoints: any[]) => {
    let degreePoints: any[] = [];
    for (let index = 0; index < anchorpoints.length; index++) {
      const degree = transformCartesianToWGS84(anchorpoints[index]);
      degreePoints.push(degree);
    }
    let pointlist = calculateMorePoints(degreePoints);
    let degreesArray: any[] = [];
    pointlist.forEach((item: any) => {
      degreesArray.push(item.x, item.y);
    });
    return Cesium.Cartesian3.fromDegreesArray(degreesArray);
  };
   
  function calculateMorePoints(anchorpoints: any[]) {
    let ratio = 6;
    let pointsR: any[];
    if (anchorpoints.length > 2) {
      let l = 0,
        w,
        pointS,
        pointE;
      for (let i = 0; i < anchorpoints.length - 1; i++) {
        pointS = anchorpoints[i]; //取出首尾两个点
        pointE = anchorpoints[i + 1];
        l += Math.sqrt(
          (pointE.y - pointS.y) * (pointE.y - pointS.y) +
            (pointE.x - pointS.x) * (pointE.x - pointS.x)
        );
      }
      w = l / ratio;
      let points_C_l: any[] = []; //定义左右控制点集合
      let points_C_r: any[] = [];
      let point_t_l: x_y = { x: undefined, y: undefined }; //定义尾部左右的起始点
      let point_t_r: x_y = { x: undefined, y: undefined };
      //计算中间的所有交点
      for (let j = 0; j < anchorpoints.length - 2; j++) {
        let pointU_1 = anchorpoints[j]; //第一个用户传入的点
        let pointU_2 = anchorpoints[j + 1]; //第二个用户传入的点
        let pointU_3 = anchorpoints[j + 2]; //第三个用户传入的点
        //计算向量
        let v_U_1_2 = { x: pointU_2.x - pointU_1.x, y: pointU_2.y - pointU_1.y };
        let v_U_2_3 = { x: pointU_3.x - pointU_2.x, y: pointU_3.y - pointU_2.y };
        let v_lr_1_2 = calculateVector(v_U_1_2, Math.PI / 2, w / 2);
        let v_l_1_2 = v_lr_1_2[0];
        let v_r_1_2 = v_lr_1_2[1];
        let v_lr_2_3 = calculateVector(v_U_2_3, Math.PI / 2, w / 2);
        let v_l_2_3 = v_lr_2_3[0];
        let v_r_2_3 = v_lr_2_3[1];
        //获取左右
        let point_l_1 = { x: pointU_1.x + v_l_1_2.x, y: pointU_1.y + v_l_1_2.y };
        let point_r_1 = { x: pointU_1.x + v_r_1_2.x, y: pointU_1.y + v_r_1_2.y };
        let point_l_2 = { x: pointU_2.x + v_l_2_3.x, y: pointU_2.y + v_l_2_3.y };
        let point_r_2 = { x: pointU_2.x + v_r_2_3.x, y: pointU_2.y + v_r_2_3.y };
        //向量v_U_1_2和向量v-point_l_1和point_r_1是平行的
        //如果向量a=(x1，y1)，b=(x2，y2)，则a//b等价于x1y2－x2y1=0
        //得到(x-point_l_1.x)*v_U_1_2.y=v_U_1_2.x*(y-point_l_1.y)
        //得到(point_l_2.x-x)*v_U_2_3.y=v_U_2_3.x*(point_l_2.y-y)
        //可以求出坐边的交点(x,y)，即控制点
        let point_C_l = calculateIntersection(
          v_U_1_2,
          v_U_2_3,
          point_l_1,
          point_l_2
        );
        let point_C_r = calculateIntersection(
          v_U_1_2,
          v_U_2_3,
          point_r_1,
          point_r_2
        );
        //定义中间的控制点
        let point_C_l_c: x_y;
        let point_C_r_c: x_y;
        if (j == 0) {
          //记录下箭头尾部的左右两个端点
          point_t_l = point_l_1;
          point_t_r = point_r_1;
          //计算第一个曲线控制点
          point_C_l_c = {
            x: (point_t_l.x + point_C_l.x) / 2,
            y: (point_t_l.y + point_C_l.y) / 2,
          };
          point_C_r_c = {
            x: (point_t_r.x + point_C_r.x) / 2,
            y: (point_t_r.y + point_C_r.y) / 2,
          };
          //添加两个拐角控制点中间的中间控制点
          points_C_l.push(point_C_l_c);
          points_C_r.push(point_C_r_c);
        } else {
          //获取前一个拐角控制点
          let point_C_l_q = points_C_l[points_C_l.length - 1];
          let point_C_r_q = points_C_r[points_C_r.length - 1];
          //计算两个拐角之间的中心控制点
          point_C_l_c = {
            x: (point_C_l_q.x + point_C_l.x) / 2,
            y: (point_C_l_q.y + point_C_l.y) / 2,
          };
          point_C_r_c = {
            x: (point_C_r_q.x + point_C_r.x) / 2,
            y: (point_C_r_q.y + point_C_r.y) / 2,
          };
          //添加两个拐角控制点中间的中间控制点
          points_C_l.push(point_C_l_c);
          points_C_r.push(point_C_r_c);
        }
        //添加后面的拐角控制点
        points_C_l.push(point_C_l);
        points_C_r.push(point_C_r);
      }
      //计算
      //进入计算头部
      //计算一下头部的长度
      let pointU_E2 = anchorpoints[anchorpoints.length - 2]; //倒数第二个用户点
      let pointU_E1 = anchorpoints[anchorpoints.length - 1]; //最后一个用户点
      let v_U_E2_E1 = {
        x: pointU_E1.x - pointU_E2.x,
        y: pointU_E1.y - pointU_E2.y,
      };
      let head_d = Math.sqrt(
        v_U_E2_E1.x * v_U_E2_E1.x + v_U_E2_E1.y * v_U_E2_E1.y
      );
      //定义头部的左右两结束点
      let point_h_l: x_y;
      let point_h_r: x_y;
      //头部左右两向量数组
      let v_lr_h: any[] = [];
      let v_l_h: x_y = { x: undefined, y: undefined };
      let v_r_h: x_y = { x: undefined, y: undefined };
      //定义曲线最后一个控制点，也就是头部结束点和最后一个拐角点的中点
      let point_C_l_e: x_y = { x: undefined, y: undefined };
      let point_C_r_e: x_y = { x: undefined, y: undefined };
      //定义三角形的左右两个点
      let point_triangle_l: x_y = { x: undefined, y: undefined };
      let point_triangle_r: x_y = { x: undefined, y: undefined };
      //获取当前的最后的控制点，也就是之前计算的拐角点
      let point_C_l_eq = points_C_l[points_C_l.length - 1];
      let point_C_r_eq = points_C_r[points_C_r.length - 1];
      //三角的高度都不够
      if (head_d <= w) {
        v_lr_h = calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
        v_l_h = v_lr_h[0];
        v_r_h = v_lr_h[1];
        //获取头部的左右两结束点
        point_h_l = { x: pointU_E2.x + v_l_h.x, y: pointU_E2.y + v_l_h.y };
        point_h_r = { x: pointU_E2.x + v_r_h.x, y: pointU_E2.y + v_r_h.y };
        //计算最后的控制点
        point_C_l_e = {
          x: (point_C_l_eq.x + point_h_l.x) / 2,
          y: (point_C_l_eq.y + point_h_l.y) / 2,
        };
        point_C_r_e = {
          x: (point_C_r_eq.x + point_h_r.x) / 2,
          y: (point_C_r_eq.y + point_h_r.y) / 2,
        };
        //添加最后的控制点（中心点）
        points_C_l.push(point_C_l_e);
        points_C_r.push(point_C_r_e);
        //计算三角形的左右两点
        point_triangle_l = {
          x: 2 * point_h_l.x - pointU_E2.x,
          y: 2 * point_h_l.y - pointU_E2.y,
        };
        point_triangle_r = {
          x: 2 * point_h_r.x - pointU_E2.x,
          y: 2 * point_h_r.y - pointU_E2.y,
        };
      }
      //足够三角的高度
      else {
        //由于够了三角的高度，所以首先去掉三角的高度
        //计算向量
        let v_E2_E1 = {
          x: pointU_E1.x - pointU_E2.x,
          y: pointU_E1.y - pointU_E2.y,
        };
        //取模
        let v_E2_E1_d = Math.sqrt(v_E2_E1.x * v_E2_E1.x + v_E2_E1.y * v_E2_E1.y);
        //首先需要计算三角形的底部中心点
        let point_c = {
          x: pointU_E1.x - (v_E2_E1.x * w) / v_E2_E1_d,
          y: pointU_E1.y - (v_E2_E1.y * w) / v_E2_E1_d,
        };
        //计算出在三角形上底边上头部结束点
        v_lr_h = calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
        v_l_h = v_lr_h[0];
        v_r_h = v_lr_h[1];
        //获取头部的左右两结束点
        point_h_l = { x: point_c.x + v_l_h.x, y: point_c.y + v_l_h.y };
        point_h_r = { x: point_c.x + v_r_h.x, y: point_c.y + v_r_h.y };
        //计算最后的控制点
        point_C_l_e = {
          x: (point_C_l_eq.x + point_h_l.x) / 2,
          y: (point_C_l_eq.y + point_h_l.y) / 2,
        };
        point_C_r_e = {
          x: (point_C_r_eq.x + point_h_r.x) / 2,
          y: (point_C_r_eq.y + point_h_r.y) / 2,
        };
        //添加最后的控制点（中心点）
        points_C_l.push(point_C_l_e);
        points_C_r.push(point_C_r_e);
        //计算三角形的左右点
        point_triangle_l = {
          x: 2 * point_h_l.x - point_c.x,
          y: 2 * point_h_l.y - point_c.y,
        };
        point_triangle_r = {
          x: 2 * point_h_r.x - point_c.x,
          y: 2 * point_h_r.y - point_c.y,
        };
      }
      //使用控制点计算差值
      //计算贝塞尔的控制点
      let points_BC_l = [],
        points_BC_r = [];
      for (let i = 0; i < points_C_l.length - 2; i++) {
        let temp_l: any[] = [];
        let temp_r: any[] = [];
        let temp1_l = points_C_l[i];
        let temp2_l = points_C_l[i + 1];
        let temp3_l = points_C_l[i + 2];
        let temp1_r = points_C_r[i];
        let temp2_r = points_C_r[i + 1];
        let temp3_r = points_C_r[i + 2];
        temp_l.push(temp1_l, temp2_l, temp3_l);
        temp_r.push(temp1_r, temp2_r, temp3_r);
        let points_temp_l = createBezierPoints(temp_l);
        let points_temp_r = createBezierPoints(temp_r);
        points_BC_l = points_BC_l.concat(points_temp_l);
        points_BC_r = points_BC_r.concat(points_temp_r);
      }
      //组合左右点集和三角形三个点
      pointsR = [point_t_l];
      //首先连接左边的差值曲线
      pointsR = pointsR.concat(points_BC_l);
      //添加左边头部结束点
      pointsR.push(point_h_l);
      //添加三角形左边点
      pointsR.push(point_triangle_l);
      //添加三角形顶点
      pointsR.push(pointU_E1);
      //添加三角形右边点
      pointsR.push(point_triangle_r);
      //添加右边头部结束点
      pointsR.push(point_h_r);
      //合并右边的所有点（先把右边的点倒序）
      pointsR = pointsR.concat(points_BC_r.reverse());
   
      //添加右边尾部起始点
      pointsR.push(point_t_r);
    } else {
      pointsR = calculateTwoPoints(anchorpoints);
    }
    return pointsR;
  }
  /**
   * 绘制直角箭头相关
   * @param anchorpoints
   * @param type 1-平尾直角；2-燕尾直角
   * @returns
   */
  function calculateTwoPoints(anchorpoints: any[], type: number = 1) {
    let ratio = 6;
    let pointS = anchorpoints[0]; //箭头起点
    let pointE = anchorpoints[1]; //箭头终点
    let controlPois: any[] = [];
    let v_based = { x: pointE.x - pointS.x, y: pointE.y - pointS.y }; //计算基准向量
    let l = Math.sqrt(
      (pointE.x - pointS.x) * (pointE.x - pointS.x) +
        (pointE.y - pointS.y) * (pointE.y - pointS.y)
    ); //计算箭头长度
    let w = l / ratio; //箭头宽度
    let x_ = pointS.x + (5 * (pointE.x - pointS.x)) / ratio; //箭头前端三角形中点坐标x
    let y_ = pointS.y + (5 * (pointE.y - pointS.y)) / ratio; //箭头前端三角形中点坐标y
    let v_lr = calculateVector(v_based, Math.PI / 2, w / 2);
    let v_l = v_lr[0];
    let v_r = v_lr[1];
    let point1 = { x: pointS.x + v_l.x, y: pointS.y + v_l.y };
    let point2 = { x: x_ + v_l.x, y: y_ + v_l.y };
    let point3 = { x: x_ + 2 * v_l.x, y: y_ + 2 * v_l.y };
    let point4 = { x: pointE.x, y: pointE.y };
    let point5 = { x: x_ + 2 * v_r.x, y: y_ + 2 * v_r.y };
    let point6 = { x: x_ + v_r.x, y: y_ + v_r.y };
    let point7 = { x: pointS.x + v_r.x, y: pointS.y + v_r.y };
    switch (type) {
      case 1:
        controlPois.push(point1, point2, point3, point4, point5, point6, point7);
        break;
      case 2:
        let point8 = {
          x: pointS.x + (pointE.x - pointS.x) / 10,
          y: pointS.y + (pointE.y - pointS.y) / 10,
        };
        controlPois.push(
          point1,
          point2,
          point3,
          point4,
          point5,
          point6,
          point7,
          point8
        );
        break;
   
      default:
        break;
    }
   
    return controlPois;
  }
  function calculateVector(v: x_y, theta: number, d: number) {
    if (!theta) theta = Math.PI / 2;
    if (!d) d = 1;
    let x_1;
    let x_2;
    let y_1;
    let y_2;
    let v_l;
    let v_r;
    let d_v = Math.sqrt(v.x * v.x + v.y * v.y);
    if (v.y == 0) {
      x_1 = x_2 = (d_v * d * Math.cos(theta)) / v.x;
      if (v.x > 0) {
        y_1 = Math.sqrt(d * d - x_1 * x_1);
        y_2 = -y_1;
      } else if (v.x < 0) {
        y_2 = Math.sqrt(d * d - x_1 * x_1);
        y_1 = -y_2;
      }
      v_l = { x: x_1, y: y_1 };
      v_r = { x: x_2, y: y_2 };
    } else {
      let n = -v.x / v.y;
      let m = (d * d_v * Math.cos(theta)) / v.y;
      let a = 1 + n * n;
      let b = 2 * n * m;
      let c = m * m - d * d;
      x_1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      x_2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      y_1 = n * x_1 + m;
      y_2 = n * x_2 + m;
      if (v.y >= 0) {
        v_l = { x: x_1, y: y_1 };
        v_r = { x: x_2, y: y_2 };
      } else if (v.y < 0) {
        v_l = { x: x_2, y: y_2 };
        v_r = { x: x_1, y: y_1 };
      }
    }
    return [v_l, v_r];
  }
  function calculateIntersection(v_1: x_y, v_2: x_y, point1: x_y, point2: x_y) {
    let x;
    let y;
    if (v_1.y * v_2.x - v_1.x * v_2.y == 0) {
      if (v_1.x * v_2.x > 0 || v_1.y * v_2.y > 0) {
        x = (point1.x + point2.x) / 2;
        y = (point1.y + point2.y) / 2;
      } else {
        x = point2.x;
        y = point2.y;
      }
    } else {
      //
      x =
        (v_1.x * v_2.x * (point2.y - point1.y) +
          point1.x * v_1.y * v_2.x -
          point2.x * v_2.y * v_1.x) /
        (v_1.y * v_2.x - v_1.x * v_2.y);
      if (v_1.x != 0) {
        y = ((x - point1.x) * v_1.y) / v_1.x + point1.y;
      } else {
        y = ((x - point2.x) * v_2.y) / v_2.x + point2.y;
      }
    }
    return { x: x, y: y };
  }
   
  /**
   * 计算贝塞尔曲线特征点
   * @param anchorpoints
   * @param t
   * @returns -  {{x: number, y: number}}
   * @private
   */
  const computeBezierPoints = (anchorpoints: any[], t: number) => {
    let x = 0,
      y = 0;
    let Binomial_coefficient = computeBinomial(anchorpoints);
    for (let j = 0; j < anchorpoints.length; j++) {
      let tempPoint = anchorpoints[j];
      const coefficient =
        Math.pow(1 - t, anchorpoints.length - 1 - j) *
        Math.pow(t, j) *
        Binomial_coefficient[j];
      x += tempPoint.x * coefficient;
      y += tempPoint.y * coefficient;
    }
    return { x, y };
  };
  /**
   * 计算二项式系数
   * @param anchorpoints
   * @returns - {Array}
   * @private
   */
  const computeBinomial = (anchorpoints: any[]) => {
    let lens = anchorpoints.length;
    let Binomial_coefficient: number[] = [];
    Binomial_coefficient.push(1);
    for (let k = 1; k < lens - 1; k++) {
      let cs = 1,
        bcs = 1;
      for (let m = 0; m < k; m++) {
        cs = cs * (lens - 1 - m);
        bcs = bcs * (k - m);
      }
      Binomial_coefficient.push(cs / bcs);
    }
    Binomial_coefficient.push(1);
    return Binomial_coefficient;
  };
   
  /**
   * 获取椭圆和圆形的轴长
   * @param points
   * @returns
   */
  const getSemiAxis = (points: any[]) => {
    return points.length === 2
      ? Cesium.Cartesian3.distance(points[0], points[1])
      : 0;
  };
  /**
   * 获取椭圆旋转的角度
   * @param points
   * @returns
   */
  const getEllipticAngle = (points: any[]) => {
    let p1 = transformCartesianToWGS84(points[0]);
    let p2 = transformCartesianToWGS84(points[1]);
    let angle = 450 - calculateAngle(p1, p2);
    return Cesium.Math.toRadians(angle);
  };
   
  /**
   * 获取矩形顶点
   * @param points
   * @returns
   */
  const calculateRectanglePoints = (points: any[]) => {
    const p1 = transformCartesianToWGS84(points[0]);
    const p2 = points[1] ? transformCartesianToWGS84(points[1]) : p1;
    return Cesium.Cartesian3.fromDegreesArray([
      p1.x,
      p1.y,
      p2.x,
      p1.y,
      p2.x,
      p2.y,
      p1.x,
      p2.y,
    ]);
  };
   
  /**
   * 计算集结地特征点
   * @param anchorpoints
   * @returns {Array}
   * @private
   */
  const computeAssemblePoints = (anchorpoints: any[]) => {
    let points: any[] = [];
   
    let originP = transformCartesianToWGS84(anchorpoints[0]);
    let lastP = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: originP.x + 0.00001, y: originP.y + 0.00001, z: originP.z };
    let vectorOL = { x: lastP.x - originP.x, y: lastP.y - originP.y };
    let dOL = Math.sqrt(vectorOL.x * vectorOL.x + vectorOL.y * vectorOL.y);
    let v_O_P1_lr = calculateVector(
      vectorOL,
      Math.PI / 3,
      (Math.sqrt(3) / 12) * dOL
    );
    let originP_P1 = v_O_P1_lr[1];
    let p1 = { x: originP.x + originP_P1.x, y: originP.y + originP_P1.y };
    let p2 = { x: (originP.x + lastP.x) / 2, y: (originP.y + lastP.y) / 2 };
    let v_L_P3_lr = calculateVector(
      vectorOL,
      (Math.PI * 2) / 3,
      (Math.sqrt(3) / 12) * dOL
    );
    let lastP_P3 = v_L_P3_lr[1];
    let p3 = { x: lastP.x + lastP_P3.x, y: lastP.y + lastP_P3.y };
    let v_O_P5_lr = calculateVector(vectorOL, Math.PI / 2, (1 / 2) * dOL);
    let v_O_P5 = v_O_P5_lr[0];
    let p5 = { x: v_O_P5.x + p2.x, y: v_O_P5.y + p2.y };
    let p0 = originP;
    let p4 = lastP;
    points.push(p0, p1, p2, p3, p4, p5);
    const closeCardinal = createCloseCardinal(points);
    const fb_points = calculatePointsFBZ3(closeCardinal, 100);
    let result: number[] = [];
    for (let index = 0; index < fb_points.length; index++) {
      const ele = fb_points[index];
      result.push(ele.x, ele.y, 0);
    }
    return result;
  };
  /**
   * 生成闭合的样条点
   * @param points
   * @returns {*}
   */
  function createCloseCardinal(points: any[]): any {
    if (points == null || points.length < 3) {
      return points;
    }
    //获取起点，作为终点，以闭合曲线。
    let lastP = points[0];
    points.push(lastP);
    //定义传入的点数组，将在点数组中央（每两个点）插入两个控制点
    let cPoints = points;
    //包含输入点和控制点的数组
    let cardinalPoints: any[] = [];
    //至少三个点以上
    //这些都是相关资料测出的经验数值
    //定义张力系数，取值在0<t<0.5
    let t = 0.4;
    //为端点张力系数因子，取值在0<b<1
    // let b = 0.5;
    //误差控制，是一个大于等于0的数，用于三点非常趋近与一条直线时，减少计算量
    let e = 0.005;
    //传入的点数量，至少有三个，n至少为2
    let n = cPoints.length - 1;
    //从开始遍历到倒数第二个，其中倒数第二个用于计算起点（终点）的插值控制点
    for (let k = 0; k <= n - 1; k++) {
      let p0, p1, p2;
      //计算起点（终点）的左右控制点
      if (k == n - 1) {
        //三个基础输入点
        p0 = cPoints[n - 1];
        p1 = cPoints[0];
        p2 = cPoints[1];
      } else {
        p0 = cPoints[k];
        p1 = cPoints[k + 1];
        p2 = cPoints[k + 2];
      }
      //定义p1的左控制点和右控制点
      let p1l: any = { x: undefined, y: undefined };
      let p1r: any = { x: undefined, y: undefined };
      //通过p0、p1、p2计算p1点的做控制点p1l和又控制点p1r
      //计算向量p0_p1和p1_p2
      let p0_p1 = { x: p1.x - p0.x, y: p1.y - p0.y };
      let p1_p2 = { x: p2.x - p1.x, y: p2.y - p1.y };
      //并计算模
      let d01 = Math.sqrt(p0_p1.x * p0_p1.x + p0_p1.y * p0_p1.y);
      let d12 = Math.sqrt(p1_p2.x * p1_p2.x + p1_p2.y * p1_p2.y);
      //向量单位化
      let p0_p1_1 = { x: p0_p1.x / d01, y: p0_p1.y / d01 };
      let p1_p2_1 = { x: p1_p2.x / d12, y: p1_p2.y / d12 };
      //计算向量p0_p1和p1_p2的夹角平分线向量
      let p0_p1_p2 = { x: p0_p1_1.x + p1_p2_1.x, y: p0_p1_1.y + p1_p2_1.y };
      //计算向量 p0_p1_p2 的模
      let d012 = Math.sqrt(p0_p1_p2.x * p0_p1_p2.x + p0_p1_p2.y * p0_p1_p2.y);
      //单位化向量p0_p1_p2
      let p0_p1_p2_1 = { x: p0_p1_p2.x / d012, y: p0_p1_p2.y / d012 };
      //判断p0、p1、p2是否共线，这里判定向量p0_p1和p1_p2的夹角的余弦和1的差值小于e就认为三点共线
      let cosE_p0p1p2 = (p0_p1_1.x * p1_p2_1.x + p0_p1_1.y * p1_p2_1.y) / 1;
      //共线
      if (Math.abs(1 - cosE_p0p1p2) < e) {
        //计算p1l的坐标
        p1l.x = p1.x - p1_p2_1.x * d01 * t;
        p1l.y = p1.y - p1_p2_1.y * d01 * t;
        //计算p1r的坐标
        p1r.x = p1.x + p0_p1_1.x * d12 * t;
        p1r.y = p1.y + p0_p1_1.y * d12 * t;
      }
      //非共线
      else {
        //计算p1l的坐标
        p1l.x = p1.x - p0_p1_p2_1.x * d01 * t;
        p1l.y = p1.y - p0_p1_p2_1.y * d01 * t;
        //计算p1r的坐标
        p1r.x = p1.x + p0_p1_p2_1.x * d12 * t;
        p1r.y = p1.y + p0_p1_p2_1.y * d12 * t;
      }
      //记录起点（终点）的左右插值控制点及倒数第二个控制点
      if (k == n - 1) {
        cardinalPoints[0] = p1;
        cardinalPoints[1] = p1r;
        cardinalPoints[(n - 2) * 3 + 2 + 3] = p1l;
        cardinalPoints[(n - 2) * 3 + 2 + 4] = cPoints[n];
      } else {
        //记录下这三个控制点
        cardinalPoints[k * 3 + 2 + 0] = p1l;
        cardinalPoints[k * 3 + 2 + 1] = p1;
        cardinalPoints[k * 3 + 2 + 2] = p1r;
      }
    }
    return cardinalPoints;
  }
  /**
   * 计算三阶贝塞尔点
   * @param points
   * @param part
   * @returns {Array}
   */
  function calculatePointsFBZ3(points: any[], part: number): Array<any> {
    if (!part) part = 20;
    //获取待拆分的点
    let bezierPts: any = [];
    let scale = 0.05;
    if (part > 0) {
      scale = 1 / part;
    }
    for (let i = 0; i < points.length - 3; ) {
      //起始点
      let pointS = points[i];
      //第一个控制点
      let pointC1 = points[i + 1];
      //第二个控制点
      let pointC2 = points[i + 2];
      //结束点
      let pointE = points[i + 3];
      bezierPts.push(pointS);
      for (let t = 0; t < 1; ) {
        //三次贝塞尔曲线公式
        let x =
          (1 - t) * (1 - t) * (1 - t) * pointS.x +
          3 * t * (1 - t) * (1 - t) * pointC1.x +
          3 * t * t * (1 - t) * pointC2.x +
          t * t * t * pointE.x;
        let y =
          (1 - t) * (1 - t) * (1 - t) * pointS.y +
          3 * t * (1 - t) * (1 - t) * pointC1.y +
          3 * t * t * (1 - t) * pointC2.y +
          t * t * t * pointE.y;
        let point = { x: x, y: y };
        bezierPts.push(point);
        t += scale;
      }
      i += 3;
      if (i >= points.length) {
        bezierPts.push(pointS);
      }
    }
    return bezierPts;
  }
  const calculateSwallowPoints = (anchorpoints: any[], type: number) => {
    let points: any[] = [];
    switch (type) {
      case 1:
        points = computeSwallowtailArrow(anchorpoints);
        break;
      case 2:
        points = computeSwallowtailArrow2(anchorpoints);
        break;
      case 3:
        points = computeSwallowtailArrow(anchorpoints, false);
      default:
        break;
    }
    return points;
  };
  /**
   * 计算燕尾箭头特征点
   * @param anchorpoints
   * @returns {number[]}
   * @private
   */
  const computeSwallowtailArrow = (
    anchorpoints: any[],
    swallow: boolean = true
  ): number[] => {
    let p0 = transformCartesianToWGS84(anchorpoints[0]);
    let p1 = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: p0.x + 0.00001, y: p0.y + 0.00001, z: p0.z };
    let x0 = p0.x;
    let y0 = p0.y;
    let x1 = p1.x;
    let y1 = p1.y;
    let xt = (15.8 * x1 + 3.2 * x0) / 19;
    let yt = (15.8 * y1 + 3.2 * y0) / 19;
    let ap = new Array(7);
    ap[0] = { x: x1, y: y1 };
    ap[1] = {
      x: xt + (0.85 / 3.2) * (y1 - yt),
      y: yt - (0.85 / 3.2) * (x1 - xt),
    };
    ap[2] = {
      x: xt + (0.25 / 3.2) * (y1 - yt),
      y: yt - (0.25 / 3.2) * (x1 - xt),
    };
    ap[3] = { x: x0 + (1.6 / 19) * (y1 - y0), y: y0 - (1.6 / 19) * (x1 - x0) };
    ap[4] = swallow
      ? { x: (3.2 * x1 + 15.8 * x0) / 19, y: (3.2 * y1 + 15.8 * y0) / 19 }
      : undefined;
    ap[5] = { x: x0 - (1.6 / 19) * (y1 - y0), y: y0 + (1.6 / 19) * (x1 - x0) };
    ap[6] = {
      x: xt - (0.25 / 3.2) * (y1 - yt),
      y: yt + (0.25 / 3.2) * (x1 - xt),
    };
    ap[7] = {
      x: xt - (0.85 / 3.2) * (y1 - yt),
      y: yt + (0.85 / 3.2) * (x1 - xt),
    };
    let degress: number[] = [];
    for (let index = 0; index < ap.length; index++) {
      const ele = ap[index];
      ele && degress.push(ele.x, ele.y, 0);
    }
    return degress;
  };
  /**
   * 计算燕尾箭头2特征点
   * @param anchorpoints
   */
  const computeSwallowtailArrow2 = (anchorpoints: any[]) => {
    let p0 = transformCartesianToWGS84(anchorpoints[0]);
    let p1 = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: p0.x + 0.00001, y: p0.y + 0.00001, z: p0.z };
   
    let pointlist = calculateTwoPoints([p0, p1], 2);
    let degreesArray: any[] = [];
    pointlist.forEach((item: any) => {
      degreesArray.push(item.x, item.y, 0);
    });
    return degreesArray;
  };
  /**
   * 计算钳击箭头特征点
   * @param points
   * @returns
   */
  const calculatePincerArrowPoint = (points: any[]) => {
    if (points.length < 3) return null;
    let lnglatArr: number[][] = [];
    for (let i = 0; i < points.length; i++) {
      let degree = transformCartesianToWGS84(points[i]);
      lnglatArr.push([degree.x, degree.y]);
    }
    let res = xp.algorithm.doubleArrow(lnglatArr);
    let result = [];
    let index = JSON.stringify(res.polygonalPoint).indexOf('null');
    if (index == -1) result = res.polygonalPoint;
    return result;
  };
  const calculateFlagPoints = (points: any[], type: number = 0) => {
    let p0 = transformCartesianToWGS84(points[0]);
    let p1 = points[1]
      ? transformCartesianToWGS84(points[1])
      : { x: p0.x + 0.00001, y: p0.y + 0.00001, z: p0.z };
    const pnts = [
      [p0.x, p0.y],
      [p1.x, p1.y],
    ];
    let arcArr = getFlagPoints(pnts, type);
    return Cesium.Cartesian3.fromDegreesArray([].concat.apply([], arcArr));
  };
  /**
   *
   * @param {*} points
   * @param {*} type 0-曲线，1-直线，2-正三角，3-倒三角，4-对三角
   * @returns
   */
  function getFlagPoints(points, type: number = 0) {
    type = type ? type : 0;
    let components: any[] = [];
    // 至少需要两个控制点
    if (points.length > 1) {
      // 取第一个
      let startPoint = points[0];
      // 取最后一个
      let endPoint = points[points.length - 1];
      // 中间点
      let pointCenter = [
        endPoint[0],
        (endPoint[1] - startPoint[1]) / 4 + startPoint[1],
      ];
      // 上曲线起始点
      let point1 = startPoint;
      // 上曲线第一控制点
      let point2 = [
        (endPoint[0] - startPoint[0]) / 4 + startPoint[0],
        (endPoint[1] - startPoint[1]) / 8 + startPoint[1],
      ];
      // 上曲线第二个点
      let point3 = [(startPoint[0] + endPoint[0]) / 2, startPoint[1]];
      // 上曲线第二控制点
      let point4 = [
        ((endPoint[0] - startPoint[0]) * 3) / 4 + startPoint[0],
        -(endPoint[1] - startPoint[1]) / 8 + startPoint[1],
      ];
      // 上曲线结束点
      let point5 = [endPoint[0], startPoint[1]];
      // 下曲线结束点
      let point6 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
      // 下曲线第二控制点
      let point7 = [
        ((endPoint[0] - startPoint[0]) * 3) / 4 + startPoint[0],
        ((endPoint[1] - startPoint[1]) * 3) / 8 + startPoint[1],
      ];
      // 下曲线第二个点
      let point8 = [
        (startPoint[0] + endPoint[0]) / 2,
        (startPoint[1] + endPoint[1]) / 2,
      ];
      // 下曲线第一控制点
      let point9 = [
        (endPoint[0] - startPoint[0]) / 4 + startPoint[0],
        ((endPoint[1] - startPoint[1]) * 5) / 8 + startPoint[1],
      ];
      // 下曲线起始点
      let point10 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
      // 旗杆底部点
      let point11 = [startPoint[0], endPoint[1]];
      // 底部左点
      let point12 = [
        startPoint[0] - (endPoint[0] - startPoint[0]) / 30,
        endPoint[1],
      ];
      // 顶部左点
      let point13 = [
        startPoint[0] - (endPoint[0] - startPoint[0]) / 30,
        startPoint[1],
      ];
      let curve1Points, curve2Points;
      //type：0-曲线，1-直线，2-正三角，3-倒三角，4-对三角
      switch (type) {
        case 0:
          curve1Points = [point1, point2, point3, point4, point5];
          curve2Points = [
            point6,
            point7,
            point8,
            point9,
            point10,
            point10,
            point10,
            point10,
            point10,
          ];
          break;
        case 1:
          curve1Points = [point1, point5];
          curve2Points = [point6, point10, point10, point10, point10, point10];
          break;
        case 2:
          curve1Points = [point1, point6];
          curve2Points = [point6, point10, point10, point10, point10, point10];
          break;
        case 3:
          curve1Points = [point1, point5];
          curve2Points = [point5, point10, point10, point10, point10, point10];
          break;
        case 4:
          curve1Points = [point1, pointCenter];
          curve2Points = [
            pointCenter,
            point10,
            point10,
            point10,
            point10,
            point10,
          ];
          break;
      }
      // 计算上曲线
      let curveTop = getBezierPoints(curve1Points);
      // 计算下曲线
      let curveBottom = getBezierPoints(curve2Points);
      // 合并
      components = curveTop.concat(curveBottom);
      components.push(point11, point12);
      components.push(point13);
    }
    return components;
  }
  /**
   * 贝塞尔曲线
   * @param points
   * @returns {*}
   */
  function getBezierPoints(points: any[]) {
    if (points.length <= 2) {
      return points;
    } else {
      let bezierPoints: any[] = [];
      let n = points.length - 1;
      for (let t = 0; t <= 1; t += 0.01) {
        let [x, y] = [0, 0];
        for (let index = 0; index <= n; index++) {
          let factor = getBinomialFactor(n, index);
          let a = Math.pow(t, index);
          let b = Math.pow(1 - t, n - index);
          x += factor * a * b * points[index][0];
          y += factor * a * b * points[index][1];
        }
        bezierPoints.push([x, y]);
      }
      bezierPoints.push(points[n]);
      return bezierPoints;
    }
  }
  /**
   * 获取二项分布
   * @param n
   * @param index
   * @returns {number}
   */
  function getBinomialFactor(n: number, index: number) {
    return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
  }
  /**
   * 获取阶乘数据
   * @param n
   * @returns {number}
   */
  function getFactorial(n: number) {
    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  /**
   * 计算并构建阵型过程点
   * @param {*} anchorpoints
   * @returns
   */
  const calculateFormationPoints = (anchorpoints: any[], type: number) => {
    let pos0 = transformCartesianToWGS84(anchorpoints[0]);
    let pos1 = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: pos0.x + 0.00001, y: pos0.y + 0.00001, z: pos0.z };
    const centerX = (pos0.x + pos1.x) / 2;
    const centerY = (pos0.y + pos1.y) / 2;
    const center = { x: centerX, y: centerY }; //起点和终点的中间点坐标
    const lectCartesian3 = new Cesium.Cartesian3.fromDegrees(pos0.x, pos0.y);
    const rightCartesian3 = new Cesium.Cartesian3.fromDegrees(pos1.x, pos1.y);
    const diameter = Cesium.Cartesian3.distance(lectCartesian3, rightCartesian3); //起终点距离，单位m
    const radius = diameter / 2; //半径
    const angle = calculateAngle(center, pos1); //中点指向终点的角度，0-360
    const sourcePos = getPointByAngleDistance(
      center.x,
      center.y,
      90 + angle,
      radius
    ); //获取模拟的圆心坐标
    const angle_left = calculateAngle(sourcePos, pos0);
    const circleRadius = Math.pow(2, 0.5) * radius;
    const points: any[] = [];
    type = type === 0 ? 0.9 : 1.1;
    for (let index = 0; index < 90; index++) {
      const cur_angle = angle_left + index;
      const cur_point = getPointByAngleDistance(
        sourcePos.x,
        sourcePos.y,
        cur_angle,
        circleRadius
      );
      points.push({ x: cur_point.x, y: cur_point.y });
      if (index != 0 && index % 15 == 0) {
        const cur_point1 = getPointByAngleDistance(
          sourcePos.x,
          sourcePos.y,
          cur_angle,
          circleRadius * type
        );
        points.push({ x: cur_point1.x, y: cur_point1.y });
        points.push({ x: cur_point.x, y: cur_point.y });
      }
    }
    let resultPos: any[] = [];
    points.forEach((item) => {
      resultPos.push(item.x, item.y);
    });
    return Cesium.Cartesian3.fromDegreesArray(resultPos);
  };
  /**
   * 计算并构建弓形过程点
   * @param {*} anchorpoints
   * @returns
   */
  const calculateBowPoints = (anchorpoints: any[]) => {
    let pos0 = transformCartesianToWGS84(anchorpoints[0]);
    let pos1 = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: pos0.x + 0.00001, y: pos0.y + 0.00001, z: pos0.z };
    const centerX = (pos0.x + pos1.x) / 2;
    const centerY = (pos0.y + pos1.y) / 2;
    const center = { x: centerX, y: centerY }; //起点和终点的中间点坐标
    const lectCartesian3 = new Cesium.Cartesian3.fromDegrees(pos0.x, pos0.y);
    const rightCartesian3 = new Cesium.Cartesian3.fromDegrees(pos1.x, pos1.y);
    const diameter = Cesium.Cartesian3.distance(lectCartesian3, rightCartesian3); //起终点距离，单位m
    const radius = diameter / 2; //半径
    const angle = calculateAngle(center, pos1); //中点指向终点的角度，0-360
    const sourcePos = getPointByAngleDistance(
      center.x,
      center.y,
      90 + angle,
      radius
    ); //获取模拟的圆心坐标
    const angle_left = calculateAngle(sourcePos, pos0);
    const circleRadius = Math.pow(2, 0.5) * radius;
    const points: any[] = [];
    for (let index = 0; index < 90; index++) {
      const cur_angle = angle_left + index;
      const cur_point = getPointByAngleDistance(
        sourcePos.x,
        sourcePos.y,
        cur_angle,
        circleRadius
      );
      points.push({ x: cur_point.x, y: cur_point.y });
    }
    let resultPos: any[] = [];
    points.forEach((item) => {
      resultPos.push(item.x, item.y);
    });
    return Cesium.Cartesian3.fromDegreesArray(resultPos);
  };
  /**
   * 已知点根据角度和距离求取另一点坐标（二维）  注：WGS84坐标系
   * @param {*} lng 经度
   * @param {*} lat 纬度
   * @param {*} angle 角度 (0~360度)
   * @param {*} distance 距离 (米)
   *
   */
  function getPointByAngleDistance(
    lng: number,
    lat: number,
    angle: number,
    distance: number
  ) {
    let a = 6378137; // 赤道半径
    let b = 6356752.3142; // 短半径
    let f = 1 / 298.257223563; // 扁率
   
    let alpha1 = angle * (Math.PI / 180);
    let sinAlpha1 = Math.sin(alpha1);
    let cosAlpha1 = Math.cos(alpha1);
    let tanU1 = (1 - f) * Math.tan(lat * (Math.PI / 180));
    let cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
      sinU1 = tanU1 * cosU1;
    let sigma1 = Math.atan2(tanU1, cosAlpha1);
    let sinAlpha = cosU1 * sinAlpha1;
    let cosSqAlpha = 1 - sinAlpha * sinAlpha;
    let uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
    let A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    let B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    let sigma = distance / (b * A),
      sigmaP = 2 * Math.PI;
    let cos2SigmaM, sinSigma, cosSigma;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
      cos2SigmaM = Math.cos(2 * sigma1 + sigma);
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      let deltaSigma =
        B *
        sinSigma *
        (cos2SigmaM +
          (B / 4) *
            (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
              (B / 6) *
                cos2SigmaM *
                (-3 + 4 * sinSigma * sinSigma) *
                (-3 + 4 * cos2SigmaM * cos2SigmaM)));
      sigmaP = sigma;
      sigma = distance / (b * A) + deltaSigma;
    }
   
    let tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    let lat2 = Math.atan2(
      sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
      (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)
    );
    let lambda = Math.atan2(
      sinSigma * sinAlpha1,
      cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
    );
    let C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    let L =
      lambda -
      (1 - C) *
        f *
        sinAlpha *
        (sigma +
          C *
            sinSigma *
            (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    return {
      x: lng + L * (180 / Math.PI),
      y: lat2 * (180 / Math.PI),
    };
  }
  /**
   * 计算圆角矩形节点
   * @param anchor
   * @returns
   */
  const computeRoundedRectanglePoints = (anchorpoints: any[]) => {
    let pos0 = transformCartesianToWGS84(anchorpoints[0]);
    let pos1 = anchorpoints[1]
      ? transformCartesianToWGS84(anchorpoints[1])
      : { x: pos0.x + 0.00001, y: pos0.y + 0.00001, z: pos0.z };
    let o_x = (pos0.x + pos1.x) / 2;
    let o_y = (pos0.y + pos1.y) / 2;
    //a为矩形的长边，b为矩形的短边
    let a = Math.abs(pos0.x - pos1.x);
    let b = Math.abs(pos0.y - pos1.y);
    let r = (1 / 10) * Math.min(a, b);
    //从左上点开始，顺时针求四个圆弧的圆心
    let o1_x = o_x - a / 2 + r;
    let o1_y = o_y - b / 2 + r;
    let o1 = { x: o1_x, y: o1_y };
    let o2 = { x: o_x + a / 2 - r, y: o_y - b / 2 + r };
    let o3 = { x: o_x + a / 2 - r, y: o_y + b / 2 - r };
    let o4 = { x: o_x - a / 2 + r, y: o_y + b / 2 - r };
    //从左上角开始画圆弧
    let step = Math.PI / 180;
    let points1: any[] = [];
    let theta1 = Math.PI;
    let theta2 = (3 / 2) * Math.PI;
    let radius1 = theta1;
    for (let i = 0; i < Math.abs(theta1 - theta2); i += step) {
      let X = o1.x + r * Math.cos(radius1);
      let Y = o1.y + r * Math.sin(radius1);
      radius1 = radius1 + step;
      radius1 = radius1 < 0 ? 2 * Math.PI + radius1 : radius1;
      radius1 = radius1 > 2 * Math.PI ? 2 * Math.PI - radius1 : radius1;
      points1.push({ x: X, y: Y });
    }
    let points2 = points1;
    let theta3 = (Math.PI * 3) / 2;
    let theta4 = 2 * Math.PI;
    let radius2 = theta3;
    for (let i = 0; i < Math.abs(theta3 - theta4); i += step) {
      let X = o2.x + r * Math.cos(radius2);
      let Y = o2.y + r * Math.sin(radius2);
      radius2 = radius2 + step;
      radius2 = radius2 < 0 ? 2 * Math.PI + radius2 : radius2;
      radius2 = radius2 > 2 * Math.PI ? 2 * Math.PI - radius2 : radius2;
      points2.push({ x: X, y: Y });
    }
    let points3 = points2;
    let theta5 = 0;
    let theta6 = (1 / 2) * Math.PI;
    let radius3 = theta5;
    for (let i = 0; i < Math.abs(theta5 - theta6); i += step) {
      let X = o3.x + r * Math.cos(radius3);
      let Y = o3.y + r * Math.sin(radius3);
      radius3 = radius3 + step;
      radius3 = radius3 < 0 ? 2 * Math.PI + radius3 : radius3;
      radius3 = radius3 > 2 * Math.PI ? 2 * Math.PI - radius3 : radius3;
      points3.push({ x: X, y: Y });
    }
    let points = points3;
    let theta7 = (1 / 2) * Math.PI;
    let theta8 = Math.PI;
    let radius4 = theta7;
    for (let i = 0; i < Math.abs(theta7 - theta8); i += step) {
      let X = o4.x + r * Math.cos(radius4);
      let Y = o4.y + r * Math.sin(radius4);
      radius4 = radius4 + step;
      radius4 = radius4 < 0 ? 2 * Math.PI + radius4 : radius4;
      radius4 = radius4 > 2 * Math.PI ? 2 * Math.PI - radius4 : radius4;
      points.push({ x: X, y: Y });
    }
    let GeoPoints: any[] = [];
    points.forEach((item) => {
      GeoPoints.push(item.x, item.y, 0);
    });
    let result = Cesium.Cartesian3.fromDegreesArrayHeights(GeoPoints);
    return result;
  };
  const calculateSectorPoints = (points: any[]) => {
    let pos0 = transformCartesianToWGS84(points[0]);
    pos0.z = 0;
    let pos1 = points[1]
      ? transformCartesianToWGS84(points[1])
      : { x: pos0.x + 0.00001, y: pos0.y, z: 0 };
    const distance = points[1]
      ? Cesium.Cartesian3.distance(points[0], points[1])
      : 0.1;
    let pos2 = points[2]
      ? transformCartesianToWGS84(points[2])
      : { x: pos1.x + 0.0000001, y: pos1.y, z: 0 };
    const startAngle = calculateAngle(pos0, pos1);
    const endAngle = calculateAngle(pos0, pos2);
    // // 将角度转换为弧度
    let startAngleRad = Math.min(startAngle, endAngle);
    let endAngleRad = Math.max(startAngle, endAngle);
    // 获取扇形的所有坐标值
    let coordinates: any[] = [];
    coordinates.push(pos0.x, pos0.y); // 扇形中心坐标
   
    // 扇形边界点坐标
    let numPoints = 100; // 分割圆弧的点数，可以根据需要调整
    let angleStep = (endAngleRad - startAngleRad) / numPoints;
    for (let i = 0; i <= numPoints; i++) {
      let angle = startAngleRad + i * angleStep;
      const point = getPointByAngleDistance(pos0.x, pos0.y, angle, distance);
      coordinates.push(point.x, point.y);
    }
    coordinates.push(pos0.x, pos0.y);
    return Cesium.Cartesian3.fromDegreesArray(coordinates);
  };
  const getLabelText = (text: string, type: number) => {
    const textArr = type ? text.split(' ') : text.split('\\n');
    let result = '';
    for (let index = 0; index < textArr.length; index++) {
      const element = textArr[index];
      result += index === 0 ? element : '\n ' + element;
    }
    return result;
  };
   
  export {
    newSessionid,
    lockingMap,
    createBezierPoints,
    getRegularPoints,
    getAttackArrowPoints,
    getRightAngleArrowPoints,
    getSemiAxis,
    getEllipticAngle,
    calculateRectanglePoints,
    computeAssemblePoints,
    calculateSwallowPoints,
    calculatePincerArrowPoint,
    calculateFlagPoints,
    calculateFormationPoints,
    calculateBowPoints,
    computeRoundedRectanglePoints,
    calculateSectorPoints,
    getLabelText,
  };