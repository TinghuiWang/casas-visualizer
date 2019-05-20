export type TActivity = {
  name: string;
  color: string;
  is_noise: boolean;
  is_ignored: boolean;
}

export type TResident = {
  name: string;
  color: string;
}

export type TSensor = {
  name: string;
  types: Array<string>;
  locX: number;
  locY: number;
  sizeX: number;
  sizeY: number;
  description: string|null;
  serial: string|null;
  tag: string|null;
}

/**
 * CASAS Smart Home Site Structure
 * path is dynamically resolved during load time.
 */
export type TSite = {
  name: string;
  floorplan: string;
  sensors: Array<TSensor>;
  timezone: string;
}

/**
 * CASAS Dataset Structure
 */
export type TDataset = {
  name: string;
  activities: Array<TActivity>;
  residents: Array<TResident>;
  site: string;
}

/**
 * Smart Home Site structure initialized with default values.
 */
export const site_init:TSite = {
  name: "",
  floorplan: "",
  sensors: [],
  timezone: ""
}

/**
 * CASAS Dataset structure initialized with default values.
 */
export const dataset_init:TDataset = {
  name: "",
  activities: [],
  residents: [],
  site: ""
}

export type TDateSplitDict = {
  [key:string]: {
    start: number;
    length: number;
  };
}

export type TActivityLookupTable = {
  [key:string]: number
}

export type TResidentLookupTable = {
  [key:string]: number
}
