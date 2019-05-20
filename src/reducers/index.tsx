import { combineReducers, Dispatch, Action, AnyAction } from 'redux';
import appConfig, { TAppConfig } from './appConfig';
import dataset, { TDataState } from './dataset';

// Additional props for connected React components. This prop is passed by default with `connect()`
export interface ConnectedReduxProps<A extends Action = AnyAction> {
  dispatch: Dispatch<A>
}

export interface IRootReducer {
  appConfig: TAppConfig;
  dataset: TDataState;
}

const rootReducer = () => combineReducers({
  appConfig, dataset
});

export default rootReducer;
