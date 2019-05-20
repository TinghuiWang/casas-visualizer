import fs from 'fs';
import es from 'event-stream';
import path from 'path';
import uniq from 'lodash/uniq';
import moment from 'moment-timezone';
import recursive from 'recursive-readdir';
import readline from 'readline';
import { ENOTDIR, EIO, EINVAL } from 'constants';
import { ErrnoException } from './error';
import { TDataset, TSite, site_init, dataset_init, TDateSplitDict, TActivity, TActivityLookupTable, TResident, TResidentLookupTable, TSensor } from './types.d';
import { promiseSerial } from './progress';
import { TSensorEvent, TDataState } from '../reducers/dataset';
import ColorCycler from './colors';
import { string } from 'prop-types';

export type TDatasetType = "annotationFile" | "directory";
export type TSensorLookup = {[key:string]: TSensor};
export type TResidentLookup = {[key:string]: TResident};

/**
 * Get full path to the data directory under dataset folder
 * @param datasetPath 
 */
export function getDatasetDataPath(datasetPath:string) {
  return path.join(datasetPath, 'data');
}

/**
 * Get full path to the site directory under dataset folder
 * @param datasetPath 
 */
export function getDatasetSitePath(datasetPath:string) {
  return path.join(datasetPath, 'site');
}

/**
 * Check if a directory exists or not. Returns a Promise of boolean type.
 * @param directory directory path
 */
function checkDirectoryExistsAsync(directory:string) : Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(directory, (err, stats) => {
      if(err) {
        if(err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        if(stats.isDirectory()) {
          resolve(true);
        } else {
          reject({
            code: "ENOTDIR",
            errno: ENOTDIR,
            message: `${directory} should be a directory. But a file with ` + 
              `the same name exists.`
          });
        }
      }
    });
  });
}

/**
 * Assert if a directory exists. If the directory is not found or a file is
 * found instead of a directory, an error is thrown.
 * @param directory directory path
 */
function AssertDirectoryExistsAsync(directory:string) {
  return new Promise((resolve, reject) => {
    fs.stat(directory, (err, stats) => {
      if(err) {
        reject(Object.assign({}, err, {
          message: "Cannot locate directory " + directory + "."
        }));
      } else {
        if(stats.isDirectory()) {
          resolve();
        } else {
          reject({
            code: "ENOTDIR",
            errno: ENOTDIR,
            message: `${directory} should be a directory. But a file with ` + 
              `the same name exists.`
          });
        }
      }
    });
  })
}

/**
 * Load smart home dataset configuration from JSON file.
 * @param directory Path to smart home data folder
 * @param datasetInit Initialized dataset structure
 */
export function loadDatasetConfigurationAsync(
  directory:string, datasetInit:TDataset
) {
  return new Promise<TDataset>((resolve, reject) => {
    const datasetConfigFilename = path.join(directory, 'dataset.json');
    fs.readFile(
      datasetConfigFilename, 'utf-8', 
      (err, data) => {
        if(err) {
          reject(Object.assign({}, err, {
            message: "Failed to read dataset configuration file " + 
              datasetConfigFilename
          }));
        } else {
          const datasetParsed = JSON.parse(data);
          const dataset = Object.assign({}, datasetInit, datasetParsed)
          resolve(dataset);
        }
      }
    );
  })
}

/**
 * Load smart home site configuration from JSON file.
 * 
 * @param directory Path to smart home site folder
 * @param siteInit Initialized smart home site structure
 */
export function loadSiteConfigurationAsync(directory:string, siteInit:TSite) {
  return new Promise<TSite>((resolve, reject) => {
    const siteConfigFilename = path.join(directory, 'site.json');
    fs.readFile(
      siteConfigFilename, 'utf-8', 
      (err, data) => {
        if(err) {
          reject(Object.assign({}, err, {
            message: "Failed to read smart home site configuration file " + 
              siteConfigFilename
          }));
        } else {
          resolve(Object.assign({}, siteInit, JSON.parse(data)));
        }
      }
    );
  })
}

/**
 * Compose a list of directory to create.
 * @param files list of files
 * @param directoryPath path to the parent directory
 */
function composeDirsToCopy(
  files:Array<string>, directoryPath:string
) {
  return uniq(files
    .map(file => file.replace(directoryPath, ''))
    .map(file => path.dirname(file))
    .filter(Boolean));
}

/**
 * Compose a list of files to copy.
 * @param files list of files
 * @param directoryPath path to the parent directory
 */
function composeFilesToCopy(
  files:Array<string>, directoryPath:string
) {
  return uniq(files
    .map(file => file.replace(directoryPath, ''))
    .map(file => {
      return path.join(path.dirname(file), path.basename(file))
    })
    .filter(Boolean)
  );
}

/**
 * Import and merge dataset and site into new dataset format
 * @param type Type of the dataset to load
 * @param datasetPath path to the dataset
 * @param sitePath path to the smart home site
 * @param outputPath path to save the imported dataset
 * @param callback callback function after success or error
 * @param progressCallback post updated information
 */
export function importDatasetFromDirectory(
  type:TDatasetType, datasetPath:string, sitePath:string, outputPath:string,
  callback: (err?:ErrnoException | null ) => void,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) {
  AssertDirectoryExistsAsync(outputPath)
  .then(() => { // Loading configurations
    if(progressCallback) {
      progressCallback(
        "Loading configuration for the dataset and smart home site.",
        false, 0, 100
      );
    }
    return Promise.all([
      loadSiteConfigurationAsync(sitePath, site_init),
      loadDatasetConfigurationAsync(datasetPath, dataset_init)
    ]);
  })
  .then((configurations) => { // Gathering files to copy
    if(progressCallback) {
      progressCallback(
        "Gathering files to copy",
        false, 0, 100
      );
    }
    return new Promise<{
      dirs:Array<string>, 
      files:Array<{from:string, to:string}>
    }>((resolve, reject) => {
      Promise.all([
        recursive(datasetPath, ['.DS_Store']),
        recursive(sitePath, ['.DS_Store'])
      ]).then((files) => {
        let datasetDirs = composeDirsToCopy(files[0], datasetPath);
        datasetDirs = datasetDirs.map(dir => {
          return path.join(outputPath, 'data', dir)
        });
        let siteDirs = composeDirsToCopy(files[1], sitePath);
        siteDirs = siteDirs.map(dir => {
          return path.join(outputPath, 'site', dir)
        });
        let dirsToCreate = new Array<string>().concat(datasetDirs, siteDirs);
        let datasetFiles = composeFilesToCopy(files[0], datasetPath);
        let siteFiles = composeFilesToCopy(files[1], sitePath);
        let filesCopyInfo = datasetFiles.map((file) => {
          return {
            from: path.join(datasetPath, file),
            to: path.join(outputPath, 'data', file)
          }
        })
        filesCopyInfo = filesCopyInfo.concat(siteFiles.map((file) => {
          return {
            from: path.join(sitePath, file),
            to: path.join(outputPath, 'site', file)
          };
        }));
        dirsToCreate = uniq(dirsToCreate);
        console.log("Dirs to create: ", dirsToCreate);
        resolve({
          dirs: dirsToCreate,
          files: filesCopyInfo
        });
      }).catch((err) => {
        reject(err);
      });
    });
  })
  .then((importInfo) => {
    return new Promise((resolve, reject) => {
      let dirsToCreate = importInfo.dirs;
      let filesCopyInfo = importInfo.files;
      let numResolved = 0;
      let total = dirsToCreate.length + filesCopyInfo.length;
      promiseSerial(dirsToCreate.map((dir) => () => {
        return new Promise((_resolve, _reject) => {
          fs.mkdir(dir, (err) => {
            if(progressCallback) {
              progressCallback(
                `Create directory ${dir}`,
                true, numResolved, total
              );
            }
            if(err) {
              _reject(err);
            } else {
              numResolved += 1;
              _resolve();
            }
          });
        });
      })).then(() => {
        console.log("List of files to copy:", filesCopyInfo);
        return promiseSerial(filesCopyInfo.map((info) => () => {
          return new Promise((_resolve, _reject) => {
            if(progressCallback) {
              progressCallback(
                `Copy file from ${info.from} to ${info.to}`,
                true, numResolved, total
              );
            }
            fs.copyFile(info.from, info.to, (err) => {
              if(err) {
                _reject(err);
              } else {
                numResolved += 1;
                _resolve()
              }
            })
          })
        }))
      }).then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });  
    });
  }).then(() => {
    callback();
  }).catch((err) => {
    callback(err);
  });
}

/**
 * Load binary sensor events from events.csv to an array of strings.
 * @param datasetPath Path to dataset directory
 * @param progressCallback Callback function to report progress
 */
export function loadSensorEventsAsync(
  datasetPath:string,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) {
  return new Promise<{
    strEvents: Array<string>;
    split: TDateSplitDict
  }>((resolve, reject) => {
    const sensorEventFilename = path.join(datasetPath, 'data', 'events.csv');
    fs.stat(sensorEventFilename, (err, stats) => {
      if(err) {
        reject(err);
      }
      const strSensorEvents = new Array<string>();
      const dateSplit:TDateSplitDict = {};
      let prevDateString = "";
      const fileSize = stats.size;
      let sizeProcessed = 0;
      let lineNumber = 0;
      let percentage = 0;
      let s = fs.createReadStream(sensorEventFilename)
      .pipe(es.split())
      .pipe(es.mapSync(function(line:string) {
        s.pause();
        lineNumber ++;
        sizeProcessed += line.length;
        let timeToken = line.split(",")[0]
        let dateString = moment(timeToken).toDate().toDateString();
        if(dateString === "Invalid Date") {
          console.log(`Warning: Invalid date found at line ${lineNumber}`);
        } else {
          strSensorEvents.push(line);
          if(!(dateString in dateSplit)) {
            // Add date string into the date split
            if(prevDateString === "") {
              prevDateString = dateString;
            } else {
              let prevDate = moment(prevDateString).add(1, 'days');
              prevDateString = prevDate.toDate().toDateString();
              while(prevDateString !== dateString) {
                dateSplit[prevDateString] = {
                  start: lineNumber - 1,
                  length: 0
                }
                prevDate = prevDate.add(1, 'days');
                prevDateString = prevDate.toDate().toDateString();
              }
            }
            dateSplit[prevDateString] = {
              start: lineNumber - 1,
              length: -1
            };
          }
          dateSplit[dateString].length = strSensorEvents.length - dateSplit[dateString].start;
        }
        if(progressCallback) {
          let newPercentage = Math.round(sizeProcessed * 100 / fileSize);
          if(newPercentage !== percentage) {
            progressCallback(
              `${lineNumber} Sensor Events loaded from file 
              ${sensorEventFilename}`, true, sizeProcessed, fileSize
            );
            percentage = newPercentage;
          }
        }
        s.resume();
      }))
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve({
          strEvents: strSensorEvents, 
          split: dateSplit
        });
      });
    });
  });
}

export function loadEventsByDateAsync(
  data:TDataState, date:string,
  progressCallback?: (
    message:string, isDeterminate:boolean, value:number, total:number
  ) => void
) {
  return new Promise<TDataState>((resolve, reject) => {
    if(date in data.dateSplit) {
      console.log("Loading events on " + date);
      let residentLookupTable = composeResidentLookupTable(data.residents);
      let activityLookupTable = composeActivityLookupTable(data.activities);
      console.log(residentLookupTable);
      let residentColorCycler = new ColorCycler();
      let activityColorCycler = new ColorCycler();
      let loadingPercentage = 0;
      let totalEvents = data.dateSplit[date].length;
      let strEventStart = data.dateSplit[date].start;
      data.eventsToday = [];
      data.residentPath = {};
      for(let resident of data.residents) {
        data.residentPath[resident.name] = [];
      }
      for(let i = strEventStart; i < strEventStart + totalEvents; i++) {
        // Parse event
        const eventTokens = data.strEventArray[i].split(",");
        const timeTag = moment(eventTokens[0]);
        const sensorId = eventTokens[1];
        const sensorMsg = eventTokens[2];
        const strResidents = eventTokens[3].split(";");
        const strActivities = eventTokens[4].split(";");
        const sensorType = eventTokens[5];
        const comment = eventTokens[6];
        const residents = strResidents.reduce(
          (result, residentName) => {
            let resident = getResidentByName(
              residentName, residentLookupTable, data.residents,
              true, residentColorCycler
            )
            if(resident !== null) {
              result.push(resident);
            }
            return result;
          }, new Array<TResident>()
        );
        if(["ON", "OPEN", "ABSENT"].includes(sensorMsg)) {
          for(let resident of residents) {
            data.residentPath[resident.name].push(sensorId);
          }
        }
        for(let residentName in data.residentPath) {
          if(data.residentPath[residentName].length === (i - strEventStart)) {
            data.residentPath[residentName].push("");
          }
        }
        const activities = strActivities.reduce(
          (result, activityName) => {
            let activity = getActivityByName(
              activityName, activityLookupTable, data.activities,
              true, activityColorCycler
            )
            if(activity !== null) {
              result.push(activity);
            }
            return result;
          }, new Array<TActivity>()
        );
        data.eventsToday.push({
          timeTag: timeTag,
          sensorId: sensorId,
          sensorMsg: sensorMsg,
          sensorType: sensorType,
          activities: activities,
          comment: comment,
          residents: residents,
          strIndex: i
        });
        let newPercentage = Math.round((i - strEventStart) * 100 / totalEvents);
        if(progressCallback && (newPercentage !== loadingPercentage)) {
          progressCallback(
            `Loading events ${i - strEventStart} / ${totalEvents}`,
            true, (i-strEventStart), totalEvents
          );
          loadingPercentage = newPercentage;
        }
      }
      resolve(data);
    } else {
      reject({
        errno: EINVAL,
        code: "EINVAL",
        message: "The date selected is invalid."
      })
    }
  });
}

export function composeActivityLookupTable(
  activities: Array<TActivity>
) {
  let activityLookupTable:TActivityLookupTable = {};
  activities.map((activity, index) => {
    activityLookupTable[activity.name] = index;
  });
  return activityLookupTable;
}

export function composeResidentLookupTable(
  residents: Array<TResident>
) {
  let residentLookupTable:TResidentLookupTable = {};
  residents.map((resident, index) => {
    residentLookupTable[resident.name] = index;
  })
  return residentLookupTable;
}

function getActivityByName(
  activityName: string, activityLookupTable:TActivityLookupTable,
  activities: Array<TActivity>, createIfNotFound: boolean,
  colorCycler: ColorCycler
) {
  if(activityName in activityLookupTable) {
    return activities[activityLookupTable[activityName]];
  } else {
    if(createIfNotFound && activityName !== "") {
      // Create Activity
      const newActivity:TActivity = {
        name: activityName,
        color: colorCycler.next("A100"),
        is_ignored: false,
        is_noise: false
      };
      activityLookupTable[activityName] = activities.length;
      activities.push(newActivity);
      return newActivity;
    } else {
      return null;
    }
  }
}

function getResidentByName(
  residentName: string, residentLookupTable:TResidentLookupTable,
  residents: Array<TResident>, createIfNotFound: boolean,
  colorCycler: ColorCycler
) {
  if(residentName in residentLookupTable) {
    return residents[residentLookupTable[residentName]];
  } else {
    if(createIfNotFound && residentName !== "") {
      // Create Activity
      const newResident:TResident = {
        name: residentName,
        color: colorCycler.next("A100")
      };
      residentLookupTable[residentName] = residents.length;
      residents.push(newResident);
      return newResident;
    } else {
      return null;
    }
  }
}

export function guessSensorType(sensor:TSensor) {
  let categories:Array<string> = [];
  for(let sensorType of sensor.types) {
    if(sensorType.toLowerCase().includes("motion")) {
      categories.push("Motion");
    }
    if(sensorType.toLowerCase().includes("door")) {
      categories.push("Door");
    }
    if(sensorType.toLowerCase().includes("item")) {
      categories.push("Item");
    }
    if(sensorType.toLowerCase().includes("battery")) {
      categories.push("Battery");
    }
    if(sensorType.toLowerCase().includes("radio") ||
       sensorType.toLowerCase().includes("zigbee")) {
        categories.push("Radio");
    }
    if(sensorType.toLowerCase().includes("light")) {
      categories.push("Light");
    }
    if(sensorType.toLowerCase().includes("lightswitch")) {
      categories.push("LightSwitch");
    }
    if(sensorType.toLowerCase().includes("temperature") ||
       sensorType.toLowerCase().includes("thermostat")) {
        categories.push("Temperature");
    }
  }
  if(categories.length === 0) {
    categories.push("Other");
  }
  return categories;
}

export function composeSensorDictionary(
  sensors:Array<TSensor>, categories?:Array<string>
) {
  let sensorDict:TSensorLookup = {};
  for(let sensor of sensors) {
    if(categories === undefined || guessSensorType(sensor).filter(
      value => categories.includes(value)
    ).length > 0) {
      sensorDict[sensor.name] = sensor;
    }
  }
  return sensorDict;
}

export function composeResidentDictionary(
  residents:Array<TResident>
) {
  let residentLookup:TResidentLookup = {}
  for(let resident of residents) {
    residentLookup[resident.name] = resident
  }
  return residentLookup;
}
