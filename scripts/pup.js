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

    if (fs.existsSync(p)) {
      if (pValid) {
        store.set(`${type}Exec`, p) // Store the new user path if valid
      }

      return [p, 3]; // User path good

    } else {
      p = path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`);

      if (fs.existsSync(p)) {
        return [p, 2]; // Switched to default

      } else {
        return ["", 0]; // Default not found
      }
    }

  } else {

    p = path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`);

    if (fs.existsSync(p)) {
      return [p, 1]; // Using default

    } else {
      return ["", 0]; // Default not found
    }
  }
}

function resetPath(type) {
  savePath(type, path.join(basePath, `asset_${type}er${process.platform == "win32" ? ".exe" : ""}`));
}

module.exports = {
  pack: savePath(PACK),
  unpack: savePath(UNPACK),
  savePath: savePath,
  resetPath: resetPath
}