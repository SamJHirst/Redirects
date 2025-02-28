$(document).delegate('#logout', 'click', function() {
    $.ajax({
        url: '/auth',
        type: 'DELETE',
        success: () => {
            location.reload();
        },
    });
});

$(document).delegate('#add', 'click', () => {
    const key = $('#key').val();
    const redirect = $('#redirect').val();

    if (key && redirect && key !== 'auth') {
        $.ajax({
            url: `/${key}`,
            type: 'POST',
            data: {
                redirect,
            },
            success: () => {
                location.reload();
            },
            error: () => {
                $('#key').addClass('is-invalid');
                $('#redirect').addClass('is-invalid');
            },
        });
    } else {
        $('#key').addClass('is-invalid');
        $('#redirect').addClass('is-invalid');
    }
});

$(document).delegate('#edit', 'click', function() {
    const key = $(this).data('key');

    $.ajax({
        url: `/${key}/json`,
        type: 'GET',
        success: (resp) => {
            $('#edit-key').val(resp.responseJSON.key),
            $('#edit-redirect').val(resp.responseJSON.redirect);
            $('#modal-edit').modal('show');
        },
    });
});

$(document).delegate('#save', 'click', () => {
    const key = $('#edit-key').val();
    const redirect = $('#edit-redirect').val();

    if (redirect) {
        $.ajax({
            url: `/${key}/redirect`,
            type: 'PATCH',
            data: {
                redirect,
            },
            success: () => {
                location.reload();
            },
            error: () => {
                $('#edit-redirect').addClass('is-invalid');
            },
        });
    } else {
        $('#edit-redirect').addClass('is-invalid');
    }
});

$(document).delegate('#toggle', 'click', function() {
    const key = $(this).data('key');

    $.ajax({
        url: `/${key}/enabled`,
        type: 'PATCH',
        success: () => {
            location.reload();
        },
    });
});

$(document).delegate('#delete', 'click', function() {
    const key = $(this).data('key');

    $.ajax({
        url: `/${key}`,
        type: 'DELETE',
        success: () => {
            location.reload();
        },
    });
});

$(document).delegate('input', 'input', () => {
    $('#key').removeClass('is-invalid');
    $('#redirect').removeClass('is-invalid');
    $('#edit-key').removeClass('is-invalid');
    $('#edit-redirect').removeClass('is-invalid');
});

$(document).delegate('#close', 'click', () => {
    $('#key').val('');
    $('#redirect').val('');
});

$(document).delegate('#cancel', 'click', () => {
    $('#edit-key').val('');
    $('#edit-redirect').val('');
});