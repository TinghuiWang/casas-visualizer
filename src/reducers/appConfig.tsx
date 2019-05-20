/**
 * Application Configurations
 * 
 * - history: list of opened course history.
 *   - name: Name of the course
 *   - path: Directory of the course
 */
import { 
  appConfigActions, IAppConfigAction
} from '../actions/appConfig';
import dataset from './dataset';

export type TDatasetHistory = {
  name: string;
  path: string;
}

export type TAppConfig = {
  history: Array<TDatasetHistory>;
  theme: string;
}

const appConfig_init : TAppConfig = {
  history: [],
  theme: "dark"
}

const appConfig = (
  state: TAppConfig = appConfig_init, action: IAppConfigAction
) => {
  switch (action.type) {
    case appConfigActions.ADD_DATASET:
      if (action.dataset) {
        return Object.assign({}, state, {
          history: [
            action.dataset,
            ...state.history
          ]
        });
      } else {
        return state;
      }
    case appConfigActions.REMOVE_DATASET:
      if (action.datasetIndex !== undefined && 
        action.datasetIndex < state.history.length) {
        state.history.splice(action.datasetIndex, 1);
        return Object.assign({}, state, {
          history: [
            ...state.history
          ]
        });
      } else {
        return state;
      }
    case appConfigActions.SELECT_THEME:
      if (action.theme) {
        return Object.assign({}, state, {
          theme: action.theme
        });
      }
    default:
      return state;
  }
}

export default appConfig;
