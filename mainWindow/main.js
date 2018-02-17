//Listen for pak locations
ipcRenderer.on("bins", (e, pakBin, unpakBin) => {
    $("form#configure #pakBin.open-file #path").html(pakBin);
    $("form#configure #unpakBin.open-file #path").html(unpakBin);
})

// Change which form is visible when select element is used
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

// Bind form submit handlers
$("form#pack .button#submit").click( (e) => {
    ipcRenderer.send("dopak", $("form#pak #src.open-folder #path").html(), $("form#pak #exp.open-file #path").html());
    return false;
});
$("form#unpack .button#submit").click( (e) => {
    ipcRenderer.send("dounpak", $("form#unpak #src.open-file #path").html(), $("form#unpak #exp.open-folder #path").html());
    return false;
});
$("form#settings .button#submit").click( (e) => {
    ipcRenderer.send("configure", $("form#configure #pakBin.open-file #path").html(), $("form#configure #unpakBin.open-file #path").html());
    return false;
});
$("form#settings .button#reset").click( (e) => {
    ipcRenderer.send("reset");
    return false;
});

//Listen for messages
ipcRenderer.on("message", (e, id, message) => {
    $("#output").html(message);
    $("#output").removeClass();
    $("#output").addClass(id);
})

// Listen for signal lock buttons, while packing/unpacking
ipcRenderer.on("lock", (e, pakBin, unpakBin) => {
    $("span.button").addClass("disabled")
})

// Listen for signal to unlockspand spans
ipcRenderer.on("unlock", (e, pakBin, unpakBin) => {
    $("span.button").removeClass("disabled")
})

// Bind folder and .pak dialogs
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