import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { throttle } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { loadState, saveState } from './utils/stateStorage';
import rootReducer from './reducers';
import { TAppConfig } from './reducers/appConfig';
import themeCollection from './utils/theme';
import MainPage from './containers/MainPage';

const composeEnhancer = compose;
const persistedState = loadState();

const store = createStore(
    rootReducer(),
    (persistedState === undefined) ? undefined : {
        appConfig: persistedState.appConfig as TAppConfig,
        dataset: undefined
    },
    composeEnhancer(
        applyMiddleware(thunk)
    )
)

store.subscribe(throttle(() => {
    const storeState = store.getState();
    saveState(storeState);
}, 1000));

type TState = {
  theme: string;
}

class App extends React.Component{
  state:TState = {
    theme: "dark"
  }

  componentDidMount() {
    this.setState({
      theme: store.getState().appConfig.theme
    });

    store.subscribe(throttle(() => {
      if(store.getState().appConfig.theme !== this.state.theme) {
        this.setState({
          theme: store.getState().appConfig.theme
        });
      }
    }));
  }

  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider theme={themeCollection[this.state.theme]}>
          <CssBaseline />
          <MainPage></MainPage>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
