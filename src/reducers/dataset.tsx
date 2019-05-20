import { site_init, TActivity, TResident, TSite, TDateSplitDict } from "../utils/types.d";
import moment, { Moment } from 'moment-timezone';
import { datasetActions } from "../actions/dataset";

export type TSensorEvent = {
  strIndex: number;
  timeTag: Moment;
  sensorId: string;
  sensorMsg: string;
  sensorType: string;
  residents: Array<TResident>;
  activities: Array<TActivity>;
  comment: string;
}

export type TAmbientRecording = {
  sensorId: string;
  readings: Array<TAmbientReading>
}

export type TAmbientReading = {
  timeTag: Moment;
  reading: number;
}

export type TResidentPath = {
  [key:string]: Array<string>
}

export type TDataState = {
  path: string;
  name: string;
  activities: Array<TActivity>;
  residents: Array<TResident>;
  site: TSite;
  strEventArray: Array<string>;
  startDate: Moment;
  endDate: Moment;
  currentDate: Moment;
  eventsToday: Array<TSensorEvent>;
  dateSplit: TDateSplitDict;
  residentPath: TResidentPath;
}

export const datasetState_init:TDataState = {
  path: "",
  name: "",
  activities: [],
  residents: [],
  site: site_init,
  strEventArray: [],
  startDate: moment(),
  endDate: moment(),
  currentDate: moment(),
  eventsToday: [],
  dateSplit: {},
  residentPath: {}
}

const dataset = (
  state:TDataState=datasetState_init, action:any
) => {
  switch(action.type) {
    case datasetActions.UPDATE_DATASET:
      return Object.assign({}, state, action.state);
    default:
      return state;
  }
};

export default dataset;
