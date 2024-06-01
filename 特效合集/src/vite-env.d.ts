/// <reference types="vite/client" />
export {};
//全局变量名
declare global {
  interface Window {
    Cesium: any;
    Viewer: any;
    viewer: any;
    tiandituToken: any;
    echarts: any;
  }
}
