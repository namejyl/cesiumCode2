// cesium 坐标转换
// 在Cesium中，你可以使用Cartesian3类来处理坐标转换。以下是几种常见的坐标转换方法：

// WGS84转到本地坐标（Cartesian3）：
var scene = viewer.scene;
var positionWGS84 = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
var positionLocal = scene.globe.ellipsoid.cartographicToCartesian(positionWGS84);

// 本地坐标（Cartesian3）转到WGS84：
var scene = viewer.scene;
var positionLocal = new Cesium.Cartesian3(x, y, z); // 本地坐标
var positionWGS84 = scene.globe.ellipsoid.cartesianToCartographic(positionLocal);

// 将地理坐标（经度和纬度）转换为Cartesian3：
var scene = viewer.scene;
var positionWGS84 = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

// 将Cartesian3转换为地理坐标（经度和纬度）：
var scene = viewer.scene;
var positionCartesian = new Cesium.Cartesian3(x, y, z);
var positionWGS84 = scene.globe.ellipsoid.cartesianToCartographic(positionCartesian);
var longitude = Cesium.Math.toDegrees(positionWGS84.longitude);
var latitude = Cesium.Math.toDegrees(positionWGS84.latitude);
var height = positionWGS84.height;

// 以上代码示例展示了如何在WGS84坐标系和本地坐标系之间转换。其中viewer是Cesium Viewer的实例。需要注意的是，所有的坐标转换都是基于当前场景中的地球椭球体模型。
