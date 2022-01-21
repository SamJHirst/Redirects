function login() {
    $.post('/login/', {
        username: $('#username').val(),
        password: $('#password').val()
    }).done(() => {
        location.reload();
    }).fail(() => {
        $('#username').addClass('is-invalid');
        $('#password').addClass('is-invalid');
    });
}

$(document).delegate('button', 'click', () => {
    login();
});

$(document).keypress((e) => {
    if(e.which == 13) {
        login();
    }
});

$(document).delegate('input', 'input', () => {
    $('#username').removeClass('is-invalid');
    $('#password').removeClass('is-invalid');
})