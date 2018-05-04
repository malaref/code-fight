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
    $("#message-form").submit(() => {
      socket.emit("chat", $("#message-input").val());
      $("#message-input").val("");
      return false;
    });
    socket.on("chat", (message: string) => {
      $("#messages").append($("<li class=\"list-group-item list-group-item-action w-100\">").text(message));
      $("#messages").scrollTop($("#messages").prop("scrollHeight"));
    });
  });
