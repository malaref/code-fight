$(function() {
    ace.require("ace/ext/language_tools");
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/python");
    editor.setFontSize("20px");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });

    const socket = io();

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
    let original = "";
    let updating = false;
    let syncing = false;
    let turn = true;
    editor.setValue(original);
    const sync = () => {
        syncing = true;
        turn = true;
        while (updating && turn);
        if (original != editor.getValue()) {
            socket.emit("change",
                        JsDiff.createPatch("", original, editor.getValue(), "", ""));
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
    });
    sync();
});
