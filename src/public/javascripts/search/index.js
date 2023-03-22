$(function () {
  // 當表單被提交時，使用ajax方法發送POST請求
  $('#moto-search-form').on('submit', function (event) {
    event.preventDefault();
    const license_no = $('#license_no').val();
    if (license_no === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '請輸入車牌號碼',
      });
      return;
    }
    $.ajax({
      type: 'POST',
      url: '/search',
      data: { license_no },
      success: function (data) {
        console.log('success', data);
        window.location.href = `/moto/${license_no}`;
      },
      error: async (xhr, status, error) => {
        const isNewMoto = await Swal.fire({
          title: '這是一位新客人！',
          text: '請問要新增客戶資料嗎？',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '新增',
          cancelButtonText: '取消',
        });
        if (isNewMoto.isConfirmed) {
          Swal.fire({
            title: '客戶資料',
            html: `
            <div class="d-flex flex-wrap">
              <input id="owner_name" class="w-50 swal2-input flex-grow-1" placeholder="顧客稱呼">
              <input id="owner_phone" class="w-50 swal2-input flex-grow-1" placeholder="顧客電話(選填)">
            </div>`,
            showCancelButton: true,
            confirmButtonText: '新增',
            cancelButtonText: '取消',
            showLoaderOnConfirm: true,
            preConfirm: () => {
              const owner_name = document.getElementById('owner_name').value;
              const owner_phone = document.getElementById('owner_phone').value;
              if (!owner_name) {
                Swal.showValidationMessage(`請輸入顧客稱呼`);
              } else {
                return $.ajax({
                  type: 'POST',
                  url: '/moto',
                  data: { license_no, owner_name, owner_phone },
                  success: function (data) {
                    let timerInterval;
                    Swal.fire({
                      title: '新增用戶成功！',
                      text: '即將跳轉至新用戶頁面',
                      timer: 1500,
                      timerProgressBar: true,
                      didOpen: () => {
                        Swal.showLoading();
                      },
                      willClose: () => {
                        clearInterval(timerInterval);
                      },
                    }).then((result) => {
                      if (result.dismiss === Swal.DismissReason.timer) {
                        console.log('I was closed by the timer');
                        window.location.href = `/moto/${license_no}`;
                      }
                    });
                  },
                  error: async (xhr, status, error) => {
                    // 顯示錯誤訊息
                    Swal.hideLoading() 
                    return Swal.showValidationMessage(`Request failed: ${xhr.responseJSON.message}`);
                  },
                });
              }
            },
            allowOutsideClick: () => !Swal.isLoading(),
          });
        }
      },
    });
  });
});
