const Cesium = window.Cesium;
export default () => {
  let t = window.Viewer,
    i = window.tiandituToken;
  let e = ['矢量底图', '矢量注记', '影像底图', '影像注记', '地形晕渲', '地形注记', '地形', '国界'];
  var a = 'https://t{s}.tianditu.gov.cn/',
    n = ['0', '1', '2', '3', '4', '5', '6', '7'];
  for (let A = 0; A < e.length; A++) {
    switch (e[A]) {
      case '矢量底图':
        var r = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(r);
        break;
      case '矢量注记':
        var o = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(o);
        break;
      case '影像底图':
        var s = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(s);
        break;
      case '影像注记':
        var l = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(l);
        break;
      case '地形晕渲':
        var c = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(c);
        break;
      case '地形注记':
        var u = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 18
        });
        t.imageryLayers.addImageryProvider(u);
        break;
      case '地形':
        for (var d = new Array(), m = 0; m < n.length; m++) {
          var h = a.replace('{s}', n[m]) + 'DataServer?T=elv_c&tk=' + i;
          d.push(h);
        }
        var p = new Cesium.createWorldTerrain({
          urls: d
        });
        t.terrainProvider = p;
        break;
      case '国界':
        var g = new Cesium.UrlTemplateImageryProvider({
          url: a + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + i,
          subdomains: n,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 10
        });
        t.imageryLayers.addImageryProvider(g);
    }
  }
};
