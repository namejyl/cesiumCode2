//雾气效果
class FogEffect {
  private Cesium: any = null;
  private viewer: any = null;
  private visibility: any = null;
  private color: any = null;
  private _show: boolean;
  private fogStage: any = null;

  constructor(Cesium: any, viewer: any, options: any) {
    this.Cesium = Cesium;
    if (!viewer) throw new Error("no viewer object!");

    options = options || {};
    this.visibility = Cesium.defaultValue(options.visibility, 0.1);
    this.color = Cesium.defaultValue(options.color, new Cesium.Color(0.8, 0.8, 0.8, 0.5));
    this._show = Cesium.defaultValue(options.show, true);
    this.viewer = viewer;
    this.init();
  }

  private fog(): string {
    return "uniform sampler2D colorTexture;\n\
      uniform sampler2D depthTexture;\n\
      uniform float visibility;\n\
      uniform vec4 fogColor;\n\
      varying vec2 v_textureCoordinates; \n\
      void main(void) \n\
      { \n\
          vec4 origcolor = texture2D(colorTexture, v_textureCoordinates); \n\
          float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
          vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates); \n\
          float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
          if (f < 0.0) f = 0.0; \n\
          else if (f > 1.0) f = 1.0; \n\
          gl_FragColor = mix(origcolor, fogColor, f); \n\
      }\n";
  }

  private init(): void {
    this.fogStage = new this.Cesium.PostProcessStage({
      name: "czml_fog",
      fragmentShader: this.fog(),
      uniforms: {
        visibility: () => {
          return this.visibility;
        },
        fogColor: () => {
          return this.color;
        },
      },
    });
    this.viewer.scene.postProcessStages.add(this.fogStage);
  }

  //销毁对象
  public destroy(): void {
    if (!this.viewer || !this.fogStage) return;

    this.viewer.scene.postProcessStages.remove(this.fogStage);
    this.fogStage.destroy();
    delete this.visibility;
    delete this.color;
  }

  //控制显示
  public show(visible: boolean): void {
    this._show = visible;
    this.fogStage.enabled = this._show;
  }
}

export default FogEffect;