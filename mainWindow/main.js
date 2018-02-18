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
    ipcRenderer.send("dopack", $("form#pack #src.open-folder #path").html(), $("form#pack #exp.open-file #path").html());
    return false;
});
$("form#unpack .button#submit").click( (e) => {
    ipcRenderer.send("dounpack", $("form#unpack #src.open-file #path").html(), $("form#unpack #exp.open-folder #path").html());
    return false;
});
$("form#settings .button#submit").click( (e) => {
    ipcRenderer.send("configure", $("form#settings #packExec.open-file #path").html(), $("form#settings #unpackExec.open-file #path").html());
    return false;
});
$("form#settings .button#reset").click( (e) => {
    ipcRenderer.send("reset");
    return false;
});

// Bind folder and file open interfaces
$(".open-folder span").click(function() {
    dialog.showOpenDialog(
        {
            title: "Open Folder",
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

$(".open-file span").click(function() {
    dialog.showOpenDialog(
        {
            title: "Open .pak",
            properties: [ 
                "openFile", 
                "createDirectory"
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
    $("span.button").addClass("disabled")
})

// Listen for unlock buttons message, when packing/unpacking is finished
ipcRenderer.on("unlock", (e, packExec, unpackExec) => {
    $("span.button").removeClass("disabled")
})