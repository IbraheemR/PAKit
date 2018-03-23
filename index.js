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

const PACK = "pack";
const UNPACK = "unpack";

//check for updates
const version = require("./scripts/update.js");
global.versionString = version.versionString;

//setup pack/unpack stuff and locate executables
let pup = global.pup = require("./scripts/pup.js");

// Get command line args
const commandLineArgs = require("command-line-args")
const options = commandLineArgs([
  {name: "pack", type: Boolean},
  {name: "unpack", type: Boolean},
  {name: "in", alias: "i", type: String},
  {name: "out", alias: "o", type: String},
  {name: "hidden", alias: "h", type: Boolean}
])

global.pathIn = options["in"];
global.pathOut = options["out"];

global.mode = options["pack"] ? 1 : (options["unpack"] ? 2 : options["hidden"])
console.log(`Mode:${global.mode}, in:${global.in}, out:${global.out}`)

// main stuff
let process;
let window;
app.on("ready", () => {
  // Which execution mode shoud I use?
  if (options["pack"]) {
    window = createMinWindow(PACK, options["input"], options["output"]);
    
  } else if (options["unpack"]) {
    window = createMinWindow(UNPACK, options["input"], options["output"]);
  } else {
    window = createMainWindow();
  }
});


function createMainWindow() {
  let window = new BrowserWindow({
    title: "PAKit",
    width: 700,
    height: 380,

    /* Taken from etcher source code (thanks resin.io!)*/
    resizable: false,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    autoHideMenuBar: true,

    titleBarStyle: "hiddenInset",
  });


  window.webContents.executeJavaScript("require(\"electron\").webFrame.setZoomLevelLimits(1, 1);")  // Prevent zoom
  window.webContents.on("will-navigate", (event) => {  // Prevent file drag and drop
    event.preventDefault()
  })

  // Load html into window
  window.loadURL(url.format({
      pathname: path.join(__dirname, "window/main/index.html"),
      protocol: "file:",
      slashes: true
  }))

  window.webContents.on("dom-ready", () => { // Display init file messages
    const data = {
        pack: pup.savePath(PACK),
        unpack: pup.savePath(UNPACK)
    };

    console.log(data);

    let error = "";

    for (const d in data) {
        switch (data[d].status) {
            case 0:
                error += `Cannot load default for asset_${d}er executable! Please configure it in settings.<br>`
                break;
    
            case 2:
                error += `Cannot load asset_${d}er executable! Using default.<br>`
                break;
            default:
                window.webContents.send("updatePaths");
        }
    }
    window.webContents.send("message", error ? "error" : "info", error || "");

  });

  window.on("close", () => {  // Quit app when main window closed
      if (process) {
        process.kill();
      }
      app.quit();
  });

  // Build menu
  const mainMenu = Menu.buildFromTemplate([
    {
        label:"File",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: "Alt+CmdOrCtrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            },
            { type: "separator" },
            {
                label: "Quit",
                accelerator: "CmdORCtrl+Q",
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
    }
]);

  Menu.setApplicationMenu(mainMenu);  // Insert template

  return window;
}

function createMinWindow(mode, pathIn, pathOut) {
  
}

/*
* Messages to catch from render process
*/

ipcMain.on("doPack", (e, workingFolder, workingPack) => {
    console.log("pack", workingFolder, workingPack);
    window.webContents.send("lock");
    window.webContents.send("message", 'info', `Packing ${workingFolder} into ${workingPack} (this may take a while)...`);

    process = pup.doPUP(PACK, workingFolder, workingPack, (error, stdout) =>{
        if(error) {
            if (error.signal == "SIGTERM") {
                window.webContents.send("message", 'error', "Packing stopped!\n You may have to delete created files.");
                console.log("Process killed!")
            } else {
                window.webContents.send("message", 'error', "Packing failed! Ensure all paths and files are valid (You may have to set the executables in the settings tab).");
                console.log(error);
            } 
        } else {
            window.webContents.send("message", 'info', stdout);
        }
        window.webContents.send("unlock");
    });
});

ipcMain.on("doUnpack", (e, workingPack, workingFolder) => {
    workingFolder = path.join(workingFolder, path.parse(workingPack).name); // Select a new dir so the user's folder isnt accidentally flooded

    console.log("unpack", workingPack, workingFolder);
    window.webContents.send("lock");
    window.webContents.send("message", 'info', `Unpacking ${workingFolder} into ${workingPack} (this may take a while)...`);

    process =  pup.doPUP(UNPACK, workingPack, workingFolder, (error, stdout) =>{
        if(error) {
            if (error.signal == "SIGTERM") {
                window.webContents.send("message", 'error', "Unacking stopped!\n You may have to delete newly created files.");
                console.log("Process killed!")
            } else {
                window.webContents.send("message", 'error', "Packing failed! Ensure all paths and files are valid (You may have to set the executables in the settings tab).");
                console.log(error);
            } 
        } else {
            window.webContents.send("message", 'info', stdout);
        }
        window.webContents.send("unlock");
    });
});

ipcMain.on("killPUP", () => {
    if (process) {
        process.kill();
    }
});

ipcMain.on("configure", (e, packExec, unpackExec) => {
    console.log("config", packExec, unpackExec);
    const data = {
        pack: pup.savePath(PACK, packExec),
        unpack: pup.savePath(UNPACK, unpackExec)
    };
    console.log(data);

    let error = "";

    for (const d in data) {
        switch (data[d].status) {
            case 0:
                error += `Cannot load default for asset_${d}er executable! Please configure it in settings.<br>`
                break;
    
            case 2:
                error += `Cannot load asset_${d}er executable! Using default.<br>`
                break;
            default:
                window.webContents.send("updatePaths");
        }
    }
    window.webContents.send("message", error ? "error" : "info", error || "Configuration successfull!");

});

ipcMain.on("reset", (e) => {
    console.log("reset")
    const data = {
        pack: pup.resetPath(PACK),
        unpack: pup.resetPath(UNPACK)
    };

    console.log(data);

    let error = "";

    for (const d in data) {
        switch (data[d].status) {
            case 0:
                error += `Cannot load default for asset_${d}er executable! Please configure it in settings.`
                break;
    
            case 2:
                error += `Cannot load asset_${d}er executable! Using default.`
                break;
            default:
                window.webContents.send("updatePaths");
        }
    }

    window.webContents.send("message", error ? "error" : "info",  error || "Reset successfull!");

});


