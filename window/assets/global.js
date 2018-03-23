const path = require("path");
const {shell, ipcRenderer} = require("electron");
const remote = require("electron").remote;
const dialog = remote.dialog;

window.$ = window.jQuery = require("jquery");

// Make <a> tags open in defauklt browser
$("a").click(function() {
    shell.openExternal($(this).attr("href"));
})

// Bind file and folder open/save interfaces
$(".open-file .button").click(function() {
    dialog.showOpenDialog(
        {
            title: "Open " + $(this).parent().children("#name").html(),
            defaultPath: path.join(remote.getGlobal('pup').basePath, ".."),
            properties: [ 
                "openFile", 
                "createDirectory"
            ],
        },
        (paths) => {
            if (paths) {
    // Allow user to select new path again
                $(this).parent().children("#path").html(paths[0]);
            }
        }
    );
});

$(".save-file .button").click(function() {
    dialog.showSaveDialog(
        {
            title: "Save " + $(this).parent().children("#name").html(),
            filters: [
                {name: '.pak File', extensions: ['pak']},
                {name: 'All Files', extensions: ['*']}
            ]
        },
        (path) => {
            if (path) {
                $(this).parent().children("#path").html(path);
            }
        }
    );
});

$(".open-folder .button").click(function() {
    dialog.showOpenDialog(
        {
            title: "Open " + $(this).parent().children("#name").html(),
            properties: [ 
                "openDirectory", 
                "createDirectory", 
                "promptToCreate" 
            ],
        },
        (paths) => {
            if (paths) {
                $(this).parent().children("#path").html(paths[0]);
            }
        }
    );
});

//Listen for output messages
ipcRenderer.on("message", (e, type, message) => {
    $("#output").html(message)
    .removeClass()
    .addClass(type); // Allow us to style the message based on it's type (e.g make errors red)
});

// Listen for lock buttons message, while packing/unpacking
ipcRenderer.on("lock", () => {
    $(".button").css("pointer-events", "none").addClass("disabled");
    $(".button#kill").css("pointer-events", "auto").removeClass("disabled");
});

// Listen for unlock buttons message, when packing/unpacking is finished
ipcRenderer.on("unlock", () => {
    $(".button").css("pointer-events", "auto").removeClass("disabled");
    $(".button#kill").css("pointer-events", "none").addClass("disabled");
});