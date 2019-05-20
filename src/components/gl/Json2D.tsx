import React from 'react';
import { createPropsGetter } from '../../utils/props';
import { isNullOrUndefined } from 'util';

type TReadOnlyProps = {
  width:number;
  height:number;
  renderVisitor?:TVisitorFunc;
} & Partial<TDefaultProps>;

type TDefaultProps = Readonly<typeof defaultProps>;

type TVisitorFunc = (p:any, draw:any) => any;

type TJson2DItem = {
  background: string;
  size: [number, number];
  draws: Array<any>
}

const defaultProps = {
  ratio: window.devicePixelRatio as number
}

const getProps = createPropsGetter(defaultProps);

class Json2D extends React.PureComponent<TReadOnlyProps> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null;

  constructor(props:TReadOnlyProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.ctx = null;
  }

  componentDidMount() {
    if(this.canvasRef.current) {
      this.ctx = this.canvasRef.current.getContext("2d");
      this.draw();
    }
  }

  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    const {children, renderVisitor} = getProps(this.props);
    
    
  }

  _canvasRender = () => {
    const {children, renderVisitor} = getProps(this.props);
    if(this.ctx === null) return;
    let item = children as TJson2DItem;
    
    this.ctx.save();
    

  }

  _renderRec = (draws:Array<any>, path:any, visitor:TVisitorFunc) => {
    if(this.ctx === null) return;

    let drawsLength = draws.length;
    for(let i = 0; i < drawsLength; i++) {
      let draw = draws[i];
      let p = path.concat([i]);
      if(draw instanceof Array) {
        let op = draw[0];
        if (typeof op === "object") {
          // Nested Draws
          this.ctx.save();
          this._renderRec(draw, p, visitor);
          this.ctx.restore();
        } else {
          // Draw Operation
          this._renderOp(op, draw.slice(1), p);
        }
      } else {
        let ctx = this.ctx as unknown as {[key:string]: any};
        // Style changes
        for(let k in draw) {
          ctx[k] = draw[k];
        }
      }
      visitor(p, draw);
    }
  }

  _renderOp = (op:string, args:any, path:any) => {
    if(this.ctx === null) {
      return;
    }

    switch(op) {
      case "fillText":
      case "strokeText":
        let text = args[0];
        let lines = text.split("\n");
        let linesLength = lines.length;
        let x = args[1];
        let y = args[2];
        if(linesLength === 1 || args.length < 4) {
          // Simply apply the operation
          this.ctx[op].call(this.ctx, text, x, y);
        } else {
          // Extend the text operation into multi-line text
          var lineHeight = args[3];
          for (var i=0; i<linesLength; ++i) {
            this.ctx[op].call(this.ctx, lines[i], x, y + i * lineHeight);
          }
        }
        break;
      default:
        let ctx = this.ctx as unknown as {[key:string]: any}
        let f = ctx[op];
        if (typeof f === "function") {
          f.apply(this.ctx, args);
        }
        break;
    }
  }

  render() {
    const {width, height, ratio} = getProps(this.props);

    return (
      <canvas
        ref={this.canvasRef}
        style={{width, height}}
        width={width * ratio}
        height={height * ratio}
      ></canvas>
    )
  }

}

export default Json2D;
