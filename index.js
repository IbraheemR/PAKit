 //handle setupevents as quickly as possible
 const setupEvents = require("./installers/setupEvents");
 if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don"t do anything else
  return;
 }

const electron = require("electron");
const {app, BrowserWindow, Menu, ipcMain} = electron;
const url = require("url");
const path = require("path");
const fs = require("fs");
const exec = require("child_process").execFile;
const Store = require("electron-store");
const store = new Store();

//check for updates
require("./scripts/update.js");


//setup pack/unpack stuff and loacte executables
const pup = require("./scripts/pup.js");
console.log(pup);

// // Get command line args
// const commandLineArgs = require("command-line-args")
// const options = commandLineArgs([
//   {name: "pack", type: Boolean},
//   {name: "unpack", type: Boolean},
//   {name: "in", alias: "i", type: String},
//   {name: "out", alias: "o", type: String},
//   {name: "hidden", alias: "h", type: Boolean}
// ])

// global.pathIn = options["in"];
// global.pathOut = options["out"];

// global.mode = options["pack"] ? 1 : (options["unpack"] ? 2 : options["hidden"])
// console.log(`Mode:${global.mode}, in:${global.in}, out:${global.out}`)

// main stuff
let window;
app.on("ready", () => {
   // Which execution mode shoud I use?
  //  if (options["pack"]) {
  //     window = createMainWindow();
  //  } else if (options["unpack"]) {
  //     window = createMinWindow("pack", options["input"], options["output"]);
  //  } else {
  //     window = createMinWindow("unpack", options["input"], options["output"]);
  //  }
})



