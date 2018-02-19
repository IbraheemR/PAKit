const {ipcRenderer, shell} = require("electron");
const {dialog} = require("electron").remote;

window.$ = window.jQuery = require("jquery");

// Make <a> tags open in defauklt browser
$("a").click(function() {
    shell.openExternal($(this).attr("href"));
})

// Change which form is visible when a tab is pressed is used
$(".tab").click(function() {
    $(".panel").hide();
    $(`.panel#${this.id}`).show();

    $(".tab").removeClass("active");
    $(this).addClass("active");
});
// Show the unpack panel
$(".panel").hide();
$(".panel#unpack").show();
$(".tab#unpack").addClass("active");


// 
// Bind button press handlers and IPC messengers and liseners
//

// Bind button press handlers
$("form#pack .button#submit").click( (e) => {
    ipcRenderer.send("dopack", $("form#pack #src #path").html(), $("form#pack #exp #path").html());
    return false;
});
$("form#unpack .button#submit").click( (e) => {
    ipcRenderer.send("dounpack", $("form#unpack #src #path").html(), $("form#unpack #exp #path").html());
    return false;
});
$("form#settings .button#submit").click( (e) => {
    ipcRenderer.send("configure", $("form#settings #packExec #path").html(), $("form#settings #unpackExec #path").html());
    return false;
});
$("form#settings .button#reset").click( (e) => {
    ipcRenderer.send("reset");
    return false;
});

// Bind file and folder open/save interfaces
$(".open-file .button").click(function() {
    dialog.showOpenDialog(
        {
            title: "Open " + $(this).parent().children("#name").html(),
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
    $("#output").html(message);
    $("#output").removeClass();
    $("#output").addClass(type); // Allow us to style the message based on it's type (e.g make errors red)
})

//Listen for executable locations
ipcRenderer.on("packExec", (e, path) => {
    $("form#settings #packExec.open-file #path").html(path);
})
ipcRenderer.on("unpackExec", (e, path) => {
    $("form#settings #unpackExec.open-file #path").html(path);
})


// Listen for lock buttons message, while packing/unpacking
ipcRenderer.on("lock", (e, packExec, unpackExec) => {
    $(".button").css("pointer-events", "none").addClass("disabled");
})

// Listen for unlock buttons message, when packing/unpacking is finished
ipcRenderer.on("unlock", (e, packExec, unpackExec) => {
    $(".button").css("pointer-events", "auto").removeClass("disabled");
})