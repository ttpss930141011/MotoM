$(function () {
  // 當表單被提交時，使用ajax方法發送POST請求
  $('#login-form').on('submit', function (event) {
    event.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();
    $.ajax({
      type: 'POST',
      url: '/login',
      data: { username, password },
      success: function (data) {
        // 如果驗證成功，則重定向到/
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
  });
});
