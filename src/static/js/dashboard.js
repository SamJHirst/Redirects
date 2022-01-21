$(document).delegate('#add', 'click', () => {
    const key = $('#key').val();
    const redirect = $('#redirect').val();

    if (key && redirect) {
        $.post('/add/', {
            key,
            redirect
        }).done(() => {
            location.reload();
        }).fail(() => {
            $('#key').addClass('is-invalid');
            $('#redirect').addClass('is-invalid');
        });
    } else {
        $('#key').addClass('is-invalid');
        $('#redirect').addClass('is-invalid');
    }
});

$(document).delegate('#edit', 'click', function() {
    $.post('/get/', {
        key: $(this).data('key')
    }).done((resp) => {
        key = $('#edit-key').val(resp.key),
        redirect = $('#edit-redirect').val(resp.redirect);
        $('#modal-edit').modal('show');
    });
});

$(document).delegate('#save', 'click', () => {
    const key = $('#edit-key').val();
    const redirect = $('#edit-redirect').val();

    if (redirect) {
        $.post('/edit/', {
            key: key,
            redirect: redirect
        }).done(() => {
            location.reload();
        }).fail(() => {
            $('#edit-redirect').addClass('is-invalid');
        });
    } else {
        $('#edit-redirect').addClass('is-invalid');
    }
});

$(document).delegate('#toggle', 'click', function() {
    $.post('/toggle/', {
        key: $(this).data('key')
    }).done(() => {
        location.reload();
    });
});

$(document).delegate('#delete', 'click', function() {
    $.post('/delete/', {
        key: $(this).data('key')
    }).done(() => {
        location.reload();
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