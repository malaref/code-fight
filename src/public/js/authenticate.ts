$(function() {
    $("#register-modal").modal("show");
    $("#register-nav").click((e) => {
        e.preventDefault();
        $("#register-modal").modal("show");
    });
    $("#login-nav").click((e) => {
        e.preventDefault();
        $("#login-modal").modal("show");
    });
});