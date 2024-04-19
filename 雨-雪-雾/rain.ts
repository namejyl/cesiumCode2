// 雨效果
class RainEffect {
    private Cesium: any = null;
    private tiltAngle: any = null;
    private rainSize: any = null;
    private rainSpeed: any = null;
    private viewer: any = null;
    private rainStage: any = null;

    constructor(Cesium: any, viewer: any, options: any) {
        this.Cesium = Cesium;
        if (!viewer) throw new Error("no viewer object!");

        options = options || {};
        this.tiltAngle = Cesium.defaultValue(options.tiltAngle, -0.6); //倾斜角度，负数向右，正数向左
        this.rainSize = Cesium.defaultValue(options.rainSize, 0.1); //雨大小
        this.rainSpeed = Cesium.defaultValue(options.rainSpeed, 1000.0); //雨速
        this.viewer = viewer;

        this.init();
    }
    //CLML对象，方便导出使用
    rain(): string {
        return "uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
            uniform float tiltAngle;\n\
            uniform float rainSize;\n\
            uniform float rainSpeed;\n\
            float hash(float x) {\n\
                return fract(sin(x * 133.3) * 13.13);\n\
            }\n\
            void main(void) {\n\
                float time = czm_frameNumber / rainSpeed;\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
                vec3 c = vec3(.6, .7, .8);\n\
                float a = tiltAngle;\n\
                float si = sin(a), co = cos(a);\n\
                uv *= mat2(co, -si, si, co);\n\
                uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
                float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
                float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
                c *= v * b;\n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
            }\n\
            ";
    }

    init(): void {
        this.rainStage = new this.Cesium.PostProcessStage({
            name: "czml_rain",
            fragmentShader: this.rain(),
            uniforms: {
                tiltAngle: () => {
                    return this.tiltAngle;
                },
                rainSize: () => {
                    return this.rainSize;
                },
                rainSpeed: () => {
                    return this.rainSpeed;
                },
            },
        });
        this.viewer.scene.postProcessStages.add(this.rainStage);
    }
    //销毁对象
    destroy(): void {
        if (!this.viewer || !this.rainStage) return;
        this.viewer.scene.postProcessStages.remove(this.rainStage);
        delete this.tiltAngle;
        delete this.rainSize;
        delete this.rainSpeed;
    }
    //控制显示
    show(visible: any): void {
        this.rainStage.enabled = visible;
    }

}
export default RainEffect;