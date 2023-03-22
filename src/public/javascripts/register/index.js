$(function () {
  $('#register-form').on('submit', function (event) {
    event.preventDefault();
    console.log(event);
    var username = $('#username').val();
    var password = $('#password').val();
    var password2 = $('#password-confirm').val();
    if (password !== password2) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        text: 'Passwords do not match',
        timeout: 3000,
      }).show();
    } else {
      $.ajax({
        type: 'POST',
        url: '/register',
        data: { username, password },
        success: function (data) {
          new Noty({
            type: 'success',
            layout: 'topCenter',
            text: 'Welcome!',
            timeout: 3000,
          }).show();
          setInterval(() => (window.location.href = '/'), 1000);
        },
        error: function (xhr, status, error) {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            text: xhr.responseJSON.message,
            timeout: 3000,
          }).show();
        },
      });
    }
  });
});
