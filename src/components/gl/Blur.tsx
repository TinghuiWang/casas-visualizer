import React from 'react';
import Blur1D from './Blur1D';

type TReadOnlyProps = {
  factor: number;
  passes: number;
}

// empirical strategy to chose a 2d vector for a blur pass
const NORM = Math.sqrt(2)/2;
export const directionForPass = (p: number, factor: number, total: number) => {
  const f = factor * 2 * Math.ceil(p / 2) / total;
  switch ((p-1) % 4) { // alternate horizontal, vertical and 2 diagonals
  case 0: return [f,0];
  case 1: return [0,f];
  case 2: return [f*NORM,f*NORM];
  default: return [f*NORM,-f*NORM];
  }
}

class Blur extends React.Component<TReadOnlyProps> {
  render() {
    const {children, factor, passes} = this.props;
    const rec = (pass:number) => 
      pass <= 0 ? 
      children :
      <Blur1D 
        direction={directionForPass(pass, factor, passes)}
      >
        {rec(pass-1)}
      </Blur1D>
    return rec(passes);
  }
}

export default Blur;
