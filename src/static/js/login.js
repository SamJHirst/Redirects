function login() {
    $.ajax({
        url: '/auth',
        type: 'POST',
        data: {
            password: $('#password').val()
        },
        success: () => {
            location.reload();
        },
        error: () => {
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
    $('#password').removeClass('is-invalid');
})