/**
 * Functions relating to packing and unpacking files
 * Note on statuses: 
 *  0: Defaults missing
 *  1: Using defaults
 *  2: Switched to defaults
 *  3: Using User paths
 *  */

const execFile = require('child_process').execFile;
const fs = require("fs");
const path = require("path");
const Store = require('electron-store');
const store = new Store();

/*
Path handling
*/

let paths = {};
let status = {};

const PACK = "pack";
const UNPACK = "unpack";

//Get base directory
let basePath = process.env.HOME;
switch(process.platform) {
    case "win32":
        basePath = "C:\\Program Files (x86)\\Steam\\SteamApps\\common\\Starbound\\win32\\";
        break;
    case "darwin":
        basePath += "/Library/Application Support/Steam/steamapps/common/Starbound/osx/";
        break;
    case "linux":
        basePath += "/.steam/steam/steamspps/common/Starbound/linux";
        break;
}

function savePath(type, p) {
  let pValid = (typeof p) !== 'undefined'
  p = pValid ? p : store.get(`${type}Exec`);

  if (p) {

    if (fs.existsSync(p)) {// User path good
      if (pValid) {
        store.set(`${type}Exec`, p) // Store the new user path if valid
      }

      status[type] = 3;
    } else {
      p = path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`);

      if (fs.existsSync(p)) {// Switched to default
        status[type] = 2; 

      } else {// Default not found
        status[type] = 0; 
      }
    }

  } else {

    p = path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`);

    if (fs.existsSync(p)) {// Using default
      status[type] = 1; 

    } else {// Default not found
      status[type] = 0; 
    }
  }

  paths[type] = p;
  return {
    path:paths[type],
     status:status[type]
    };
}

function resetPath(type) {
  savePath(type, path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`));
}


/*
* (Un)Packing functions
*/

doPUP(type, pathIn, pathOut, outputCallback) {
  
}

/*
* INIT
*/
savePath(PACK);
savePath(UNPACK);

module.exports = {
  PACK: PACK,
  UNPACK: UNPACK,
  paths: paths,
  status: status,
  savePath: savePath,
  resetPath: resetPath
}