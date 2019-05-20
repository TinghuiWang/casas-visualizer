import React from 'react';
import { createPropsGetter } from '../utils/props';
import { withStyles, Theme, createStyles, WithStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { Surface } from 'gl-react-dom';
import { IRootReducer } from '../reducers';
import { TDataState } from '../reducers/dataset';
import Blur from '../components/gl/Blur';
import AspectFill from '../components/gl/AspectFill';
import sizeOf from 'image-size';
import SensorCanvas from './SensorCanvas';
import { Shaders, GLSL, Node, Bus } from 'gl-react';
import ResidentPathCanvas from './ResidentPathCanvas';

const styles = (theme:Theme) => createStyles({
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {
  width:number;
  height:number;
  selectedIndex:number;
} & Partial<TDefaultProps>;

type TDefaultProps = Readonly<typeof defaultProps>;

type TPropsFromState = {
  dataset:TDataState
}

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromState;

type TState = {
  width:number;
  height:number;
}

const defaultProps = {}

const getProps = createPropsGetter(defaultProps);

const shaders = Shaders.create({
  FloorplanMerge: {
    frag: GLSL`
    precision highp float;
    varying vec2 uv;
    uniform sampler2D floorplan, sensorMap, residentPath;
    void main() {
      vec4 floorplanVec = texture2D(floorplan, uv);
      vec4 sensorMapVec = texture2D(sensorMap, uv);
      vec4 residentPathVec = texture2D(residentPath, uv);
      gl_FragColor = mix(
        mix(floorplanVec, sensorMapVec, sensorMapVec.a),
        residentPathVec, residentPathVec.a
      );
    }
    `
  }
})

class SensorEventIllustration extends React.Component<TProps, TState> {
  state:TState = {
    width: 600,
    height: 400
  }

  componentDidMount() {
    this.updateImageSizeScale();
  }

  componentDidUpdate(prevProps:TProps, prevState:TState) {
    if(prevProps.width != this.props.width || 
       prevProps.height != this.props.height) {
      this.updateImageSizeScale();
    }
  }

  updateImageSizeScale = () => {
    const {width, height, dataset} = getProps(this.props);

    let siteImageUri = dataset.path + "/site/" + 
      dataset.site.floorplan;
    let imgSize = sizeOf(siteImageUri);
    let newRatio = width/height;
    let imgRatio = imgSize.width/imgSize.height;
    let newWidth = width / Math.max(newRatio/imgRatio, 1.);
    let newHeight = height / Math.max(imgRatio/newRatio, 1.);
    this.setState({
      width: newWidth,
      height: newHeight
    });
  }

  render() {
    const {dataset, selectedIndex} = getProps(this.props);

    console.log('dataset', dataset);

    return (
      <Surface width={this.state.width} height={this.state.height}
        style={{ backgroundColor: "transparent" }}
        webglContextAttributes={{
          premultipliedAlpha: false
        }}>
        <Node 
          shader={shaders.FloorplanMerge}
          uniforms={{
            floorplan: this.refs.floorplan,
            sensorMap: this.refs.sensorMap,
            residentPath: this.refs.residentPath
          }}
        >
          <Bus ref="floorplan">
            <Blur passes={4} factor={0}>
              {"file://" + dataset.path + "/site/" + 
                dataset.site.floorplan}
            </Blur>
          </Bus>
          <Bus ref="sensorMap">
            <SensorCanvas
              width={this.state.width}
              height={this.state.height}
              sensors={dataset.site.sensors}
            ></SensorCanvas>
          </Bus>
          <Bus ref="residentPath">
            <ResidentPathCanvas
              width={this.state.width}
              height={this.state.height}
              sensors={dataset.site.sensors}
              residents={dataset.residents}
              residentPath={dataset.residentPath}
              selectedIndex={selectedIndex}
              maxHistoryInSteps={100}
            ></ResidentPathCanvas>
          </Bus>
        </Node>
      </Surface>
    );
  }
}

const mapStateToProps = (state:IRootReducer) => {
  return {
      dataset: state.dataset
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(SensorEventIllustration)
);
