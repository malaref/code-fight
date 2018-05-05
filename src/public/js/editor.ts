$(function() {
    const script_id = $("#script-id").text();

    function showAlert(data: any) {
        $("#alert-container").empty();
        const alert_div = $("<div class=\"alert alert-dismissible alert-primary\">");
        alert_div.text(data);
        alert_div.prepend($("<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>"));
        $("#alert-container").append(alert_div);
    }

    $("#new-nav").click((e) => {
        e.preventDefault();
        $("#new-script-modal").modal("show");
    });

    $("#share-button").click((e) => {
        e.preventDefault();
        $("#share-script-modal").modal("show");
    });

    $("#run-button").click((e) => {
        e.preventDefault();
        $("#run-script-modal").modal("show");
    });

    $("#share-script-form").submit((e) => {
        e.preventDefault();
        $("#share-script-modal").modal("hide");
        $.ajax({
            type: "POST",
            url: "/script/" + script_id + "/share",
            data: $("#share-script-form").serialize(),
            success: showAlert
        });
    });

    $("#run-script-form").submit((e) => {
        e.preventDefault();
        $("#run-script-modal").modal("hide");
        $.ajax({
            type: "POST",
            url: "/script/" + script_id + "/run",
            data: $("#run-script-form").serialize(),
            success: showAlert
        });
    });

    // Ace
    ace.require("ace/ext/language_tools");
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/ambiance");
    editor.session.setMode("ace/mode/python");
    editor.setFontSize("20px");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    editor.setReadOnly($("#script-id").is("[read-only]"));

    const socket = io();
    socket.on("connect", function() {
        socket.emit("script_id", script_id);
     });

    // Chat
    $("#message-form").submit(() => {
        socket.emit("chat", $("#message-input").val());
        $("#message-input").val("");
        return false;
    });
    socket.on("chat", (message: string) => {
        $("#messages").append($("<li class=\"list-group-item list-group-item-action w-100\">").text(message));
        $("#messages").scrollTop($("#messages").prop("scrollHeight"));
    });

    // Change
    let original = editor.getValue();
    let waiting = false;
    let updating = false;
    let syncing = false;
    let turn = true;
    let myPatch: string;
    const sync = () => {
        syncing = true;
        turn = true;
        while (updating && turn);
        if (!waiting && original != editor.getValue()) {
            myPatch = JsDiff.createPatch(script_id, original, editor.getValue(), "", "");
            socket.emit("change", myPatch);
            waiting = true;
        }
        syncing = false;
        setTimeout(sync, 1000);
    };
    socket.on("change", (patch: string) => {
        updating = true;
        turn = false;
        while (syncing && !turn);
        original = JsDiff.applyPatch(original, patch);
        const cursorPosition = editor.getCursorPosition();
        editor.setValue(original, 1);
        editor.moveCursorToPosition(cursorPosition);
        updating = false;
        if (patch == myPatch) {
            waiting = false;
        }
    });
    sync();
});
