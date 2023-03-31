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

    const owner_birthmonth = createOptions(1, 12);
    const owner_birthday = createOptions(1, 31);
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
            <div class="p-3 m-0">
              <div class="form-floating mb-3">
                <input id="owner_name" class="form-control" placeholder="顧客稱呼">
                <label for="floatingInput">顧客稱呼</label>
              </div>
              <div class="form-floating mb-3">
                <input id="owner_phone" class="form-control" placeholder="顧客電話">
                <label for="floatingInput">顧客電話(選填)</label>
              </div>
              <div class="row">
                <div class="col-sm-6">
                  <div class="form-floating mb-3">
                    <select id="owner_birthmonth" class="form-select" placeholder="出生月(選填)">
                      <option value="0" selected>不提供</option>
                      ${owner_birthmonth} 
                    </select>
                    <label for="floatingInput">出生月(選填)</label>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-floating mb-3">
                    <select id="owner_birthday" class="form-select" placeholder="出生日(選填)">
                      <option value="0" selected>不提供</option>
                      ${owner_birthday}
                    </select>
                    <label for="floatingInput">出生日(選填)</label>
                  </div>
                </div>
              </div>
            </div>
            `,
            showCancelButton: true,
            confirmButtonText: '新增',
            cancelButtonText: '取消',
            showLoaderOnConfirm: true,
            preConfirm: () => {
              const owner_name = document.getElementById('owner_name').value;
              const owner_phone = document.getElementById('owner_phone').value;
              const owner_birthmonth = document.getElementById('owner_birthmonth').value;
              const owner_birthday = document.getElementById('owner_birthday').value;
              if (!owner_name) {
                Swal.showValidationMessage(`請輸入顧客稱呼`);
              } else {
                return $.ajax({
                  type: 'POST',
                  url: '/moto',
                  data: { license_no, owner_name, owner_phone, owner_birthmonth, owner_birthday },
                  success: function (data) {
                    let timerInterval;
                    Swal.fire({
                      title: '新增用戶成功！',
                      text: '即將跳轉至新用戶頁面',
                      timer: 1000,
                      icon: 'success',
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
                    Swal.hideLoading();
                    console.log('error', xhr.responseJSON.message);
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

  function createOptions(start, end) {
    let options = '';
    for (let i = start; i <= end; i++) {
      let value = `0${i.toString()}`.slice(-2);
      options += `<option value="${i}">${value}</option>`;
    }
    return options;
  }
});
