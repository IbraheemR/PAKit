// Load version info
$(".panel#about #version").html(`PAKit ${remote.getGlobal("versionString")}`);

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

// Bind button press handlers
$("form#pack .button#submit").click( (e) => {
    ipcRenderer.send("doPack", $("form#pack #src #path").html(), $("form#pack #exp #path").html());
    return false;
});
$("form#pack .button#kill").click( (e) => {
    ipcRenderer.send("killPUP");
    return false;
});
$("form#unpack .button#submit").click( (e) => {
    ipcRenderer.send("doUnpack", $("form#unpack #src #path").html(), $("form#unpack #exp #path").html());
    return false;
});
$("form#unpack .button#kill").click( (e) => {
    ipcRenderer.send("killPUP");
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

// Listen for executable location update
ipcRenderer.on("updatePaths", (e) => {
    //Load executable locations
    $("form#settings #packExec.open-file #path").html(remote.getGlobal("pup").paths.pack);
    $("form#settings #unpackExec.open-file #path").html(remote.getGlobal("pup").paths.unpack);
});