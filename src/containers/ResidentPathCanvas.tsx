import React from 'react';
import { createPropsGetter } from '../utils/props';
import { TSensor, TResident } from '../utils/types.d';
import { TSensorLookup, composeSensorDictionary, TResidentLookup, composeResidentDictionary } from '../utils/dataset';
import { TResidentPath } from '../reducers/dataset';
import { fillArrow } from '../components/gl/Arrow';
import { fade } from '@material-ui/core/styles/colorManipulator';

type TReadOnlyProps = {
  width:number;
  height:number;
  sensors:Array<TSensor>;
  residents:Array<TResident>;
  residentPath:TResidentPath;
  selectedIndex: number;
} & Partial<TDefaultProps>;

type TDefaultProps = Readonly<typeof defaultProps>;

type TState = {
  sensorLookup: TSensorLookup;
  residentLookup: TResidentLookup;
  residentArrowPaths: TArrowPaths;
}

type TArrowPaths = {
  [key:string]: Array<{
    sensorSrc: string;
    sensorDst: string;
    opacity: number;
    showName: boolean;
  }>
}

const defaultProps = {
  maxHistoryInSeconds: 3600 as number,
  maxHistoryInSteps: 100 as number
}

const getProps = createPropsGetter(defaultProps);

const sensorCategories = ["Motion", "Item", "Door"];

const residentTextFont = "bold 14px arial";

class ResidentPathCanvas extends React.PureComponent<TReadOnlyProps, TState> {
  state:TState = {
    sensorLookup: {},
    residentLookup: {},
    residentArrowPaths: {}
  }

  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null;

  constructor(props:TReadOnlyProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.ctx = null;
  }

  componentDidMount() {
    const { sensors, residents } = getProps(this.props);
    this.setState({
      sensorLookup: composeSensorDictionary(sensors, sensorCategories),
      residentLookup: composeResidentDictionary(residents)
    });
    if(this.canvasRef.current) {
      this.ctx = this.canvasRef.current.getContext("2d");
      this.draw();
    }
  }

  componentDidUpdate(prevProps:TReadOnlyProps, prevState:TState) {
    const { sensors, residents } = this.props;
    if(prevProps.sensors !== sensors) {
      this.setState({
        sensorLookup: composeSensorDictionary(sensors, sensorCategories)
      });
    }
    if(prevProps.residents !== residents) {
      this.setState({
        residentLookup: composeResidentDictionary(residents)
      });
    }
    if(prevProps.selectedIndex !== this.props.selectedIndex) {
      this.composeResidentArrowPath();
    }
    this.draw();
  }

  composeResidentArrowPath = () => {
    const { residentPath, selectedIndex, maxHistoryInSteps } = getProps(this.props);
    let length = -1;
    for(let residentName in residentPath) {
      let path = residentPath[residentName];
      if(length === -1) {
        length = path.length;
      } else {
        if(length !== path.length) {
          console.error(
            "Length of residents are of different length",
            residentPath
          );
          return;  
        }
      }
    }
    if(selectedIndex >= length) {
      console.error("Index out of range.", length, selectedIndex);
      return;
    }
    let residentArrowPaths:TArrowPaths = {}
    for(let residentName in residentPath) {
      let prevDst = "";
      let opacity = 0.;
      let showName = true;
      residentArrowPaths[residentName] = []
      let path = residentPath[residentName];
      for(let i = selectedIndex; i >= 0; i--) {
        if(path[i] !== "") {
          if(prevDst === "") {
            prevDst = path[i];
            opacity = 1. + (i - selectedIndex) / maxHistoryInSteps;
          } else {
            residentArrowPaths[residentName].push({
              sensorSrc: path[i],
              sensorDst: prevDst,
              opacity: opacity,
              showName: showName
            });
            prevDst = path[i];
            opacity = 1. + (i - selectedIndex) / maxHistoryInSteps;
            showName = false;
          }
        }
        if(selectedIndex - i > maxHistoryInSteps) {
          break;
        }
      }
    }
    this.setState({
      residentArrowPaths: residentArrowPaths
    });
  }

  draw = () => {
    if(this.ctx === null) return;
    const {width, height} = getProps(this.props);
    this.ctx.clearRect(0, 0, width, height);
    console.log(this.state.residentLookup);
    console.log(this.state.sensorLookup);
    for(let residentName in this.state.residentArrowPaths) {
      let arrows = this.state.residentArrowPaths[residentName];
      let residentColor = this.state.residentLookup[residentName].color;
      for(let arrow of arrows) {
        let sensorSrc = this.state.sensorLookup[arrow.sensorSrc];
        let sensorDst = this.state.sensorLookup[arrow.sensorDst];
        let x0 = width * sensorSrc.locX;
        let y0 = height * sensorSrc.locY;
        let x1 = width * sensorDst.locX;
        let y1 = height * sensorDst.locY;
        this.ctx.fillStyle = fade(residentColor.substr(0, 7), arrow.opacity);
        fillArrow(this.ctx, x0, y0, x1, y1, 3);
        if(arrow.showName) {
          this.ctx.font = residentTextFont;
          this.ctx.textBaseline = 'top';
          this.ctx.textAlign = 'right';
          this.ctx.fillText(residentName, x1 - 4, y1 + 4)
        }
        this.ctx.save();
      }
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

export default ResidentPathCanvas;
