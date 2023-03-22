$(function () {
  $('#logout').on('click', function (event) {
    console.log(event);
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/logout',
      success: function () {
        new Noty({
          type: 'success',
          layout: 'topCenter',
          text: 'Bye !',
          timeout: 3000,
        }).show();
        setInterval(() => (window.location.href = '/'), 1000);
      },
      error: function (xhr, status, error) {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          text: error,
          timeout: 3000,
        }).show();
      },
    });
  });
});
