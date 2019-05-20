import { ErrnoException } from "../utils/error";
import { Dispatch } from "redux";
import { loadSiteConfigurationAsync, loadDatasetConfigurationAsync, getDatasetDataPath, getDatasetSitePath, loadSensorEventsAsync, loadEventsByDateAsync } from "../utils/dataset";
import { site_init, dataset_init } from "../utils/types.d";
import { datasetState_init, TDataState } from "../reducers/dataset";
import moment, { Moment } from "moment-timezone";
import { callbackify } from "util";

/**
 * Define appConfig actions
 */
export const datasetActions = {
  UPDATE_DATASET: "UPDATE_DATASET"
}

export function openDatasetAsync(
  datasetPath:string,
  callback:(err:ErrnoException | null) => void,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) {
  let datasetState = Object.assign({}, datasetState_init);
  return function(dispatch:Dispatch<any>) {
    if(progressCallback) {
      progressCallback(
        "Load dataset and site configurations",
        false, 0, 100
      );
    }
    const dataPath = getDatasetDataPath(datasetPath);
    const sitePath = getDatasetSitePath(datasetPath);
    Promise.all([
      loadSiteConfigurationAsync(sitePath, site_init),
      loadDatasetConfigurationAsync(dataPath, dataset_init)  
    ])
    .then((datasetInfo) => {
      const dataInfo = datasetInfo[1];
      const siteInfo = datasetInfo[0];
      datasetState.name = dataInfo.name;
      datasetState.activities = dataInfo.activities;
      datasetState.residents = dataInfo.residents;
      datasetState.site = siteInfo;
      // Start loading events
      return loadSensorEventsAsync(datasetPath, progressCallback);
    })
    .then((strEventsAndSplit) => {
      const strEvents = strEventsAndSplit.strEvents;
      const dateSplit = strEventsAndSplit.split;
      datasetState.strEventArray = strEvents;
      datasetState.dateSplit = dateSplit;
      const firstEvent = strEvents[0];
      const lastEvent = strEvents[strEvents.length - 1];
      datasetState.startDate = moment(firstEvent.split(",")[0]);
      datasetState.endDate = moment(lastEvent.split(",")[0]);
      datasetState.currentDate = datasetState.startDate;
      console.log('start', datasetState.startDate);
      console.log('end', datasetState.endDate);
      console.log('# events', datasetState.strEventArray.length);
      return loadEventsByDateAsync(
        datasetState, datasetState.currentDate.toDate().toDateString(),
        progressCallback
      );
    })
    .then((dataState) => {
      dataState.path = datasetPath;
      dispatch(updateDatasetState(datasetState));
      callback(null);
    })
    .catch((err) => {
      callback(err);
    })
  }
}

export function changeDatasetDate(
  date:Moment, datasetState:TDataState,
  callback:(err:ErrnoException | null) => void,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) {
  return function(dispatch:Dispatch<any>) {
    loadEventsByDateAsync(
      datasetState, date.toDate().toDateString(),
      progressCallback
    )
    .then((dataState) => {
      dataState.currentDate = date;
      dispatch(updateDatasetState(dataState));
      callback(null);
    })
    .catch((err) => {
      callback(err);
    })
  }
}

function updateDatasetState(datasetState:TDataState) {
  return {
    type: datasetActions.UPDATE_DATASET,
    state: datasetState
  };
}
