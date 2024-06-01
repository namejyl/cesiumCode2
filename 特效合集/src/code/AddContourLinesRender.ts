const Cesium = window.Cesium;
const AddContourLinesRender = () => {
  /**
   * 添加等高线(渲染)
   * @param {*} viewModel  等高线参数
   */
  var viewModel = {
    gradient: this.gradient,
    band1Position: this.band1Position,
    band2Position: this.band2Position,
    band3Position: this.band3Position,
    bandThickness: this.bandThickness,
    bandTransparency: this.bandTransparency,
    backgroundTransparency: this.backgroundTransparency
  };
  const viewer = window.viewer;
  const gradient = Boolean(viewModel.gradient);
  const band1Position = Number(viewModel.band1Position);
  const band2Position = Number(viewModel.band2Position);
  const band3Position = Number(viewModel.band3Position);
  const bandThickness = Number(viewModel.bandThickness);
  const bandTransparency = Number(viewModel.bandTransparency);
  const backgroundTransparency = Number(viewModel.backgroundTransparency);

  const layers = [];
  const backgroundLayer = {
    entries: [
      {
        height: 4200.0,
        color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency)
      },
      {
        height: 8000.0,
        color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency)
      },
      {
        height: 8500.0,
        color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency)
      }
    ],
    extendDownwards: true,
    extendUpwards: true
  };
  layers.push(backgroundLayer);

  const gridStartHeight = 4200.0;
  const gridEndHeight = 8848.0;
  const gridCount = 50;
  for (let i = 0; i < gridCount; i++) {
    const lerper = i / (gridCount - 1);
    const heightBelow = Cesium.Math.lerp(gridStartHeight, gridEndHeight, lerper);
    const heightAbove = heightBelow + 10.0;
    const alpha = Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
    layers.push({
      entries: [
        {
          height: heightBelow,
          color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
        },
        {
          height: heightAbove,
          color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
        }
      ]
    });
  }

  const antialias = Math.min(10.0, bandThickness * 0.1);

  if (!gradient) {
    const band1 = {
      entries: [
        {
          height: band1Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
        },
        {
          height: band1Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band1Position + bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band1Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
        }
      ]
    };

    const band2 = {
      entries: [
        {
          height: band2Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
        },
        {
          height: band2Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band2Position + bandThickness * 0.5,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band2Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
        }
      ]
    };

    const band3 = {
      entries: [
        {
          height: band3Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
        },
        {
          height: band3Position - bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
        }
      ]
    };

    layers.push(band1);
    layers.push(band2);
    layers.push(band3);
  } else {
    const combinedBand = {
      entries: [
        {
          height: band1Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band2Position,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        }
      ]
    };

    layers.push(combinedBand);
  }

  const material = Cesium.createElevationBandMaterial({
    scene: viewer.scene,
    layers: layers
  });
  viewer.scene.globe.material = material;
};
export default AddContourLinesRender;
