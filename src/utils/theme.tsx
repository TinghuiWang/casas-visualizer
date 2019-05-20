/**
 * Definition of built-in themes.
 */
import { 
    createMuiTheme, MuiThemeProvider, Theme 
} from '@material-ui/core/styles';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark'
  },
  typography: {
    useNextVariants: true
  }
});
  
const lightTheme = createMuiTheme({
  palette: {
    type: "light"
  },
  typography: {
    useNextVariants: true
  }
});

type TThemeCollection = {
  [key:string]: Theme
}

const themeCollection:TThemeCollection = {
  "dark": darkTheme,
  "light": lightTheme
};

export default themeCollection;
