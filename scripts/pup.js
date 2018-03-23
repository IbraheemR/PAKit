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
const {app} = require("electron");
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

function savePath(mode, p) {
  let pValid = (typeof p) !== 'undefined'
  p = pValid ? p : store.get(`${mode}Exec`);

  if (p) {

    if (fs.existsSync(p)) {// User path good
      if (pValid) {
        store.set(`${mode}Exec`, p); // Store the new user path if valid
      }

      status[mode] = 3;
    } else {
      p = path.join(basePath, `asset_${mode}er${process.platform == "win32" ? ".exe" : ""}`);

      if (fs.existsSync(p)) {// Switched to default
        status[mode] = 2; 

      } else {// Default not found
        status[mode] = 0; 
      }
    }

  } else {

    p = path.join(basePath, `asset_${mode}er${process.platform == "win32" ? ".exe" : ""}`);

    if (fs.existsSync(p)) {// Using default
      status[mode] = 1; 

    } else {// Default not found
      status[mode] = 0; 
    }
  }

  paths[mode] = p;
  return {
    path:paths[mode],
    status:status[mode]
    };
}

function resetPath(mode) {
  return savePath(mode, path.join(basePath, `asset_${mode}er${process.platform == "win32" ? ".exe" : ""}`));
}


/*
* (Un)Packing functions
*/

function doPUP(mode, pathIn, pathOut, callback) {
  return execFile(paths[mode], [pathIn, pathOut], callback);
}

module.exports = {
  PACK: PACK,
  UNPACK: UNPACK,
  basePath: basePath,
  paths: paths,
  status: status,
  savePath: savePath,
  resetPath: resetPath,
  doPUP: doPUP
}