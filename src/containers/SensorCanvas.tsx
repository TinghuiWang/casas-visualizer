import React from 'react';
import { createPropsGetter } from '../utils/props';
import { TSensor } from '../utils/types.d';
import { TSensorLookup, composeSensorDictionary, guessSensorType } from '../utils/dataset';

type TReadOnlyProps = {
  width:number;
  height:number;
  sensors:Array<TSensor>;
} & Partial<TDefaultProps>;

type TDefaultProps = Readonly<typeof defaultProps>;

type TState = {
  sensorLookup: TSensorLookup;
  sensorTextFont: string; 
  sensorTextColor: string;
}

const defaultProps = {}

const getProps = createPropsGetter(defaultProps);

const sensorCategories = ["Motion", "Item", "Door"];

type TSensorColors = {[key:string]: string};
const sensorColors:TSensorColors = {
  "Motion": "#FF0000",
  "Door": "#008000",
  "Temperature": "#B8860B",
  "Item": "#8A2BE2",
  "Light": "#FFA500",
  "LightSwitch": "#FF80CC",
  "Radio": "#FFB6C1",
  "Battery": "#20B2AA",
  "Other": "#D3D3D3"
}

class SensorCanvas extends React.PureComponent<TReadOnlyProps, TState> {
  state:TState = {
    sensorLookup: {},
    sensorTextFont: "bold 14px arial",
    sensorTextColor: "black"
  }

  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null;

  constructor(props:TReadOnlyProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.ctx = null;
  }

  componentDidMount() {
    const { sensors } = this.props;
    this.setState({
      sensorLookup: composeSensorDictionary(sensors, sensorCategories)
    });
    if(this.canvasRef.current) {
      this.ctx = this.canvasRef.current.getContext("2d");
      this.draw();
    }
  }

  componentDidUpdate(prevProps:TReadOnlyProps, prevState:TState) {
    const { sensors } = this.props;
    if(prevProps.sensors !== sensors) {
      this.setState({
        sensorLookup: composeSensorDictionary(sensors, sensorCategories)
      });
    } else {
      this.draw();
    }
  }

  getSensorColor = (sensor:TSensor) => {
    let categories = guessSensorType(sensor);
    if(categories.length > 0) {
      return sensorColors[
        categories[0]
      ];
    } else {
      return sensorColors['Other'];
    }
  }

  draw = () => {
    if(this.ctx === null) return;

    const {width, height} = getProps(this.props);

    this.ctx.clearRect(0, 0, width, height);
    for(let sensorName in this.state.sensorLookup) {
      let sensor = this.state.sensorLookup[sensorName];
      let recX = sensor.locX * width;
      let recY = sensor.locY * height;
      let recW = 4;
      let recH = 4;
      this.ctx.fillStyle = this.getSensorColor(sensor);
      this.ctx.fillRect(recX, recY, recW, recH);
      this.ctx.fillStyle = this.state.sensorTextFont;
      this.ctx.font = this.state.sensorTextFont;
      this.ctx.fillText(sensorName, recX + recW, recY + recH);
    }
    this.ctx.save();
  }

  render() {
    const {width, height} = getProps(this.props);

    return (
      <canvas
        ref={this.canvasRef}
        style={{width, height}}
        width={width}
        height={height}
      ></canvas>
    )
  }
}

export default SensorCanvas;
