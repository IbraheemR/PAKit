const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const child = require('child_process').execFile;
const Store = require('electron-store');
const store = new Store();

const {app, BrowserWindow, Menu, ipcMain} = electron;

//
// Create render process
//

let mainWindow;

app.on("ready", () => {
    // Create window
    mainWindow = new BrowserWindow({
        title: "PAcKit",
        width: 700,
        height: 380,

        /* Taken from etcher source code (thanks resin.io!)*/
        useContentSize: true,
        resizable: false,
        maximizable: false,
        fullscreen: false,
        fullscreenable: false,
        autoHideMenuBar: true,

        titleBarStyle: "hiddenInset",
    });

    // Prevent zoom
    mainWindow.webContents.executeJavaScript("require(\"electron\").webFrame.setZoomLevelLimits(1, 1);")
    // Prevent file drag and drop
    mainWindow.webContents.on("will-navigate", (event) => {
      event.preventDefault()
    })

    // Load executable paths or error message when DOM is ready
    mainWindow.webContents.on("dom-ready", () => {
        // Attempt to load binary dirs
        let packExec = store.get("packExec");
        let unpackExec = store.get("unpackExec");

        attemptExecLocation(packExec, unpackExec, /*noOutput=*/true, /*successMessage=*/"&zwnj;");
    });


    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow/mainWindow.html"),
        protocol: "file:",
        slashes: true
    }))
    // Quit app when main window closed
    mainWindow.on("close", () => {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert template
    Menu.setApplicationMenu(mainMenu);
});

// Create menu template
const mainMenuTemplate = [
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
];


//
// Locate executable files
//


let found = false;
let basePath = process.env.HOME;

//Get base path
switch(process.platform) {
    case "win23":
        basePath = "C:\\Program Files (x86)\\Steam\\SteamApps\\common\\Starbound\\win32\\";
        break;
    case "darwin":
        basePath += "/Library/Application Support/Steam/steamapps/common/Starbound/osx/";
        break;
    case "linux":
        basePath += "/.steam/steam/steamspps/common/Starbound/linux";
        break;
}

//
// Utility function to verify executable paths
//

function attemptExecLocation(packExec, unpackExec, noOutput, successMessage) {
    let errors = ""
    // check packExec
    if (fs.existsSync(packExec || " ")) {
        mainWindow.webContents.send("packExec", packExec);
        store.set("packExec", packExec);
    } else { // try base path
        packExec = basePath + "asset_packer" + (process.platform == "win32" ? ".exe" : "")
        if (fs.existsSync(packExec || " ")) {
            store.set("packExec", packExec);
            mainWindow.webContents.send("packExec", packExec);

            errors += !noOutput ? "Could not load asset_packer executable, using default\n" : "&zwnj;";
        } else {
            mainWindow.webContents.send("packExec", "&zwnj;") 
            errors += "Could not load asset_packer executable, please set it in the settings tab\n";
        }
    }

    // check unpackExec
    if (fs.existsSync(unpackExec || " ")) {
        mainWindow.webContents.send("unpackExec", unpackExec);
        store.set("unpackExec", unpackExec);
    } else { // try base path
        unpackExec = basePath + "asset_unpacker" + (process.platform == "win32" ? ".exe" : "")
        if (fs.existsSync(unpackExec || " ")) {
            store.set("unpackExec", unpackExec);
            mainWindow.webContents.send("unpackExec", unpackExec);

            errors += !noOutput ? "Could not load asset_unpacker executable, using default\n" : "&zwnj;";
        } else {
            mainWindow.webContents.send("unpackExec", "&zwnj;") 
            errors += "Could not load asset_unpacker executable, please set it in the settings tab\n";
        }
    }


    if (errors) { // Send error message if needed
        mainWindow.webContents.send("message", 'error', errors);
    } else {
        mainWindow.webContents.send("message", 'info', successMessage || 'Saved configuration!');
    }

}


//
// Bind IPC messengers and liseners
//

// Catch messages from render process
ipcMain.on("dopack", (e, workingFolder, workingPack) => {
    mainWindow.webContents.send("lock");
    
    mainWindow.webContents.send("message", 'info', `Packing ${workingFolder} into ${workingPack}...`);
    child(store.get("packExec"), [workingFolder, workingPack], (error, stdout) =>{
        if(error) {
            mainWindow.webContents.send("message", 'error', "Packing failed! Please ensure all paths and files are valid (You may have to set the executables in the settings tab).");
            console.log(error);
        } else {
            mainWindow.webContents.send("message", 'info', stdout);
        }
        mainWindow.webContents.send("unlock");
    });
});

ipcMain.on("dounpack", (e, workingPack, workingFolder) => {
    mainWindow.webContents.send("lock");
    
    mainWindow.webContents.send("message", 'info', `Unpacking ${workingPack} into ${workingFolder}...`);
    child(store.get("unpackExec"), [workingPack, path.join(workingFolder, path.basename(workinPack))], (error, stdout) =>{
        if(error) {
            mainWindow.webContents.send("message", 'error', "Unpacking failed! Please ensure all paths and files are valid (You may have to set the executables in the settings tab).");
            console.log(error);
        } else {
            mainWindow.webContents.send("message", 'info', stdout);
        }
        mainWindow.webContents.send("unlock");
    });
});

ipcMain.on("dounpack", (e, workingPack, workingFolder) => {
    mainWindow.webContents.send("message", 'info', `Recieved dounpack: ${workingPack}, ${workingFolder}`);
});

ipcMain.on("configure", (e, packExec, unpackExec) => {
    attemptExecLocation(packExec, unpackExec);
});
ipcMain.on("reset", (e) => {

    store.delete('packExec');
    store.delete('unpackExec');

    attemptExecLocation("", "", true, "Reset configuration!");
});