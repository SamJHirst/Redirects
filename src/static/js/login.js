function login() {
    $.ajax({
        url: '/auth',
        type: 'POST',
        data: {
            username: $('#username').val(),
            password: $('#password').val()
        },
        complete: () => {
            location.reload();
        },
        error: () => {
            $('#username').addClass('is-invalid');
            $('#password').addClass('is-invalid');
        },
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