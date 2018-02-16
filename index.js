const electron = require("electron");
const url = require("url");
const path = require("path");
const pathExists = require("path-exists");
const Store = require('electron-store');
const store = new Store();

const {app, BrowserWindow, Menu, ipcMain} = electron;



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
        basePath += "/.local/share/Steam/SteamApps/common/Starbound/linux32";
        break;
}

// Attempt to load binary dirs
let pakBin = store.get("pakBin");
let unpakBin = store.get("unpakBin");

let binError = false;

if (!pakBin) {
    //Attempt to load pakBin dir from default
    pakBin = basePath + "asset_packer" + (process.platform == "win32" ? ".exe" : "")
    pathExists(pakBin).then(exists => {
        if (!exists) {
            binError = "pack";
        }
    });

} else {
    pathExists(pakBin).then(exists => {
        if (!exists) {
            binError = "pack";
            store.delete("pakBin");// Delete if invalid path
        }
    });
}

if (!unpakBin) {
    //Attempt to load unpakBin dir from default
    unpakBin = basePath + "asset_unpacker" + (process.platform == "win32" ? ".exe" : "")
    pathExists(unpakBin).then(exists => {
        if (!exists) {
            binError += " unpack";
        }
    });

} else {
    pathExists(unpakBin).then(exists => {
        if (!exists) {
            binError += " unpack";
            store.delete("unpakBin"); // Delete if invalid path
        }
    });
}

console.log("bins:", unpakBin, pakBin);




let mainWindow;

app.on("ready", () => {
    // Create window
    mainWindow = new BrowserWindow({
        title: "UnPAKer",
        width: 800,
        height: 380,
        useContentSize: true,
        resizable: false,
        maximizable: false,
        fullscreen: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        titleBarStyle: "hiddenInset"
        // TODO: add icon
    });

    // Prevent zoom
    mainWindow.webContents.executeJavaScript("require(\"electron\").webFrame.setZoomLevelLimits(1, 1);")
    // Prevent file drag and drop
    mainWindow.webContents.on("will-navigate", (event) => {
      event.preventDefault()
    })

    // Load executable paths or error message
    mainWindow.webContents.on("dom-ready", () => {
        if (binError) {
            mainWindow.webContents.send("message", 'error', `Could not locate ${binError} executable. Please locate it by going to the settings pannel and seletcing it from your file system.`);
            console.log("Error on path: ", binError);
            mainWindow.webContents.send("bins", "", "");
        } else {
            console.log("Paths are good!");
            mainWindow.webContents.send("bins", pakBin, unpakBin);
        }
    });


    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
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

// Catch messages from render process
ipcMain.on("dopak", (e, workingFolder, workingPak) => {
    mainWindow.webContents.send("message", 'info', `Recieved dopak: ${workingFolder}, ${workingPak}`);
});
ipcMain.on("dounpak", (e, workingPak, workingFolder) => {
    mainWindow.webContents.send("message", 'info', `Recieved dounpak: ${workingPak}, ${workingFolder}`);
});

ipcMain.on("configure", (e, pakBin, unpakBin) => {

    store.set('pakBin', pakBin);
    store.set('unpakBin', unpakBin);

    mainWindow.webContents.send("message", 'info', `Saved configuration: ${store.get('pakBin')}, ${store.get('unpakBin')}`);
});
ipcMain.on("reset", (e, pakBin, unpakBin) => {

    store.delete('pakBin');
    store.delete('unpakBin');

    binError = "";

    pakBin =  basePath + "asset_packer" + (process.platform == "win32" ? ".exe" : "")
    pathExists(pakBin).then(exists => {
        if (!exists) {
            binError = "pack";
        }
    });
    unpakBin =  basePath + "asset_unpacker" + (process.platform == "win32" ? ".exe" : "")
    pathExists(unpakBin).then(exists => {
        if (!exists) {
            binError += " unpack";
        }
    });

    if (binError) {
        mainWindow.webContents.send("message", 'error', `Could not locate ${binError} executable. Please locate it by going to the settings pannel and seletcing it from your file system.`);
        console.log("Error on path: ", binError);
        mainWindow.webContents.send("bins", "", "");
    } else {
        mainWindow.webContents.send("message", 'info', "Reset configuration");
        mainWindow.webContents.send("bins", unpakBin, pakBin);
    }
});


// Create menu template
const mainMenuTemplate = [
    {
        label:"File",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: "Shift+CmdOrCtrl+I",
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