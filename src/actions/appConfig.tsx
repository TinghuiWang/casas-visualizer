import appConfig, { TDatasetHistory } from "../reducers/appConfig";
import { ErrnoException } from "../utils/error";
import { Dispatch } from "redux";
import { getDatasetDataPath, loadDatasetConfigurationAsync } from "../utils/dataset";
import { dataset_init } from "../utils/types.d";

/**
 * Define appConfig actions
 */
export const appConfigActions = {
  ADD_DATASET: "ADD_DATASET",
  REMOVE_DATASET: "REMOVE_DATASET",
  SELECT_THEME: "SELECT_THEME"
}

export interface IAppConfigAction {
  type: string;
  dataset?: TDatasetHistory;
  datasetIndex?: number;
  theme?: string;
}

export const appOpenDatasetAsync = (
  datasetPath:string,
  callback:(err:ErrnoException | null, value?:TDatasetHistory) => void,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) => {
  const dataPath = getDatasetDataPath(datasetPath);
  return function(dispatch:Dispatch<any>) {
    loadDatasetConfigurationAsync(dataPath, dataset_init)
    .then((dataset) => {
      dispatch(appAddDataset(dataset.name, datasetPath));
      callback(null, {
        name: dataset.name,
        path: datasetPath
      });
    })
    .catch((err) => {
      callback(err);
    })
  };
}

function appAddDataset(name:string, path:string) : IAppConfigAction {
  return {
    type: appConfigActions.ADD_DATASET,
    dataset: {
      name: name,
      path: path
    }
  }
}

export function appRemoveDataset(index:number) : IAppConfigAction {
  return {
    type: appConfigActions.REMOVE_DATASET,
    datasetIndex: index
  }
}

export function selectAppTheme(theme:string) : IAppConfigAction {
    return {
        type: appConfigActions.SELECT_THEME,
        theme: theme
    };
}