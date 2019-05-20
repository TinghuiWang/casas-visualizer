import React from 'react';
import { Shaders, GLSL, Node, Uniform } from 'gl-react';

type TReadOnlyProps = {
  width: number;
  height: number;
}

const shaders = Shaders.create({
  AspectFill: {
    vert: GLSL`
    attribute vec2 _p;
    varying vec2 uv;
    uniform float tR;
    uniform vec2 res;
    float r;
    void main() {
      r = res.x / res.y;
      gl_Position = vec4(_p,0.0,1.0);
      uv = .5+.5*_p*vec2(max(r/tR,1.),max(tR/r,1.));
    }
    `,
    frag: GLSL`
    precision highp float;
    varying vec2 uv;
    uniform sampler2D t;
    void main () {
      gl_FragColor =
        step(0.0, uv.x) *
        step(0.0, uv.y) *
        step(uv.x, 1.0) *
        step(uv.y, 1.0) *
        texture2D(t, uv);
    }
    `
  }
})

class AspectFill extends React.Component<TReadOnlyProps> {
  render() {
    const {children, width, height} = this.props;
    return (
      <Node 
        shader={shaders.AspectFill} 
        uniforms={{
          t: children,
          tR: Uniform.textureSizeRatio(children),
          res: Uniform.Resolution
        }}>
      </Node>
    );
  }
}

export default AspectFill;
