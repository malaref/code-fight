$(function() {
    $("#new-nav").click((e) => {
        e.preventDefault();
        $("#new-script-modal").modal("show");
    });

    $("#share-button").click((e) => {
        e.preventDefault();
        $("#share-modal").modal("show");
    });

    $("#run-button").click((e) => {
        e.preventDefault();
        $("#run-modal").modal("show");
    });

    const script_id = $("#script-id").text();
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
