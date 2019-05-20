import {
  red, pink, purple, deepPurple, indigo, blue, lightBlue,
  cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange,
  brown, grey, blueGrey
} from '@material-ui/core/colors';
import { Color } from '@material-ui/core';

type ColorIndex = "50" | "100" | "200" | "300" | "400" | "500" | "600" | 
  "700" | "800" | "900" | "A100" | "A200" | "A400" | "A700";

class ColorCycler {
  index:number = 0;
  colors:Array<Color> = [
    red, pink, purple, deepPurple, indigo, blue, lightBlue,
    cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange,
    brown, grey, blueGrey
  ];

  next(level:ColorIndex) : string {
    const color = this.colors[this.index][level];
    this.index = (this.index === this.colors.length - 1) ? 0 : this.index + 1;
    return color;
  }

  reset() {
    this.index = 0;
  }
}

export default ColorCycler;