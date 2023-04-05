$(document).ready(function () {
  /*-------------------------------------------------------------------------*/
  // SERVICE_TYPE 為所有業務類型
  // MotoServiceType 為機車業務類型
  const SERVICE_TYPE = {
    CREATED: '建立帳號',
    UPDATED: '更新帳號',
    REPAIR: '機車維修', // 維修
    MAINTAIN: '機車保養', // 保養
    SALES: '機車銷售', // 銷售
    RENTAL: '機車租賃', // 租賃
    PARTS: '零件販售', // 零件
    ACCESSORIES: '配件販售', // 配件
    INSURANCE: '保險相關', // 保險
    CLAIMS: '理賠處理', // 理賠
    ACCIDENT: '事故處理', // 事故
    INSPECTION: '機車檢驗', // 檢驗
    OTHER: '其他業務', // 其他
  };
  const MOTOSERVICE_TYPE = {
    REPAIR: '機車維修', // 維修
    MAINTAIN: '機車保養', // 保養
    SALES: '機車銷售', // 銷售
    RENTAL: '機車租賃', // 租賃
    PARTS: '零件販售', // 零件
    ACCESSORIES: '配件販售', // 配件
    INSURANCE: '保險相關', // 保險
    CLAIMS: '理賠處理', // 理賠
    ACCIDENT: '事故處理', // 事故
    INSPECTION: '機車檢驗', // 檢驗
    OTHER: '其他業務', // 其他
  };
  /*-------------------------------------------------------------------------*/
  // 初始化timeline
  const moto = JSON.parse(document.getElementById('moto').innerHTML);
  const { records = [] } = moto;
  const timeLines = records.map(({ price, message, createdAt, action, served_by }, index) => {
    const priceContent = price !== 0 ? [{ tag: 'p', content: `消費金額: ${price}` }] : [];
    const messageContents = message?.split('\n')?.map((line) => ({ tag: 'p', content: line })) ?? [];
    console.log(records)
    const time = dayjs(createdAt).format('YYYY/MM/DD hh:mm:ss');
    return {
      time,
      header: `
        <div class="d-flex justify-content-between align-items-center">
          <h4>${SERVICE_TYPE[action]}</h4>
          <div class="mb-2">
            <button 
              class="btn btn-outline-warning edit-record"
              type="button" 
              style="padding:.125rem .25rem;"
              data-record-index="${index}"
            >
              <i class="bi bi-pencil-square"></i>
            </button>
            <button
              class="btn btn-outline-danger delete-record"
              type="button" 
              style="padding:.125rem .25rem;"
              data-record-index="${index}"
            >
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>`,
      body: [...messageContents, ...priceContent, { tag: 'p', content: `服務人員: ${served_by?.displayname}` }],
      footer: `時間：${time}`,
    };
  });

  $('#myTimeline').albeTimeline(timeLines, {
    effect: 'zoomInUp',
    showGroup: false,
    showMenu: false,
    formatDate: 'yyyy/MM/dd | HH:mm',
    sortDesc: false,
  });

  $('.badge').each(function (index) {
    var date_time = $(this).html().split(' | ');
    $(this).html(date_time[0]);
  });
  /*-------------------------------------------------------------------------*/
  // 新增timeline
  // 點擊id = add-timeline按鈕之後，跳出Swal視窗，step 1 的視窗讓使用者選擇服務類型，選擇完後，進入step 2讓使用者填入 message & price，確認後，將資料傳送到後端新增此筆資料

  $('#add-timeline').on('click', async function (event) {
    event.preventDefault();
    const mototId = $('#id').text();
    const steps = ['1', '2'];
    const values = [];
    const serviceOptionsString = Object.keys(MOTOSERVICE_TYPE)
      .map((key) => `<option value="${key}">${SERVICE_TYPE[key]}</option>`)
      .join('');
    const swalQueueStep = Swal.mixin({
      title: `新增服務紀錄`,
      confirmButtonText: '下一步',
      cancelButtonText: '上一步',
      showCancelButton: true,
      progressSteps: [1, 2],
      reverseButtons: true,
    });
    let currentStep;
    for (currentStep = 0; currentStep < steps.length; ) {
      if (currentStep === 0) {
        const result = await swalQueueStep.fire({
          currentProgressStep: currentStep,
          showCancelButton: false,
          html: `
            <div class="p-3 m-0">
              <div class="form-floating mb-3">
                <select id="action" class="form-select" placeholder="服務類型">${serviceOptionsString}</select>
                <label for="floatingInput">服務類型</label>
              </div>`,
          preConfirm: () => {
            const action = document.getElementById('action').value;
            if (!action) return Swal.showValidationMessage(`服務類型為必填！`);
            return action;
          },
        });
        if (result.isConfirmed) {
          values[0] = result.value;
          currentStep++;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          currentStep--;
        } else {
          break;
        }
      }
      if (currentStep === 1) {
        const result = await swalQueueStep.fire({
          title: `新增 ${MOTOSERVICE_TYPE[values[0]]} 紀錄`,
          confirmButtonText: '新增紀錄',
          currentProgressStep: currentStep,
          html: `
            <div class="p-3 m-0">
              <div class="form-floating mb-3">
                <input id="price" type="number" class="form-control" placeholder="消費金額" value="0" min="0">
                <label for="floatingInput">消費金額</label>
              </div>
              <div class="form-floating mb-3">
                <textarea id="message" class="form-control" placeholder="服務內容" style="height: 100px"></textarea>
                <label for="floatingInput">服務內容</label>
              </div>
            </div>
            `,
          focusConfirm: false,
          preConfirm: () => {
            const message = document.getElementById('message').value;
            const price = document.getElementById('price').value;
            if (!message) return Swal.showValidationMessage(`請輸入服務內容`);
            if (price < 0) return Swal.showValidationMessage(`消費金額不得小於 0`);
            return {
              message,
              price,
            };
          },
        });
        if (result.isConfirmed) {
          const { message, price = '0' } = result.value;
          values[1] = message;
          values[2] = Number(price);
          currentStep++;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          currentStep--;
        } else {
          break;
        }
      }
    }
    if (currentStep === steps.length) {
      const [action, message, price] = values;
      $.ajax({
        type: 'POST',
        url: `/record`,
        data: { mototId, action, message, price },
        success: function (response) {
          let timerInterval;
          Swal.fire({
            title: '新增成功',
            text: '即將跳轉',
            icon: 'success',
            timer: 1000,
            timerProgressBar: true,
            didOpen: () => Swal.showLoading(),
            willClose: () => clearInterval(timerInterval),
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
              location.reload();
            }
          });
        },
        error: function (error) {
          Swal.fire({
            title: '新增失敗',
            text: error.responseJSON.message,
            icon: 'error',
            confirmButtonText: '確認',
          });
        },
      });
    }
  });

  /*-------------------------------------------------------------------------*/
  // 更新客戶資料
  // 點擊id = edit-moto的按鈕之後，跳出Swal視窗，並且將owner_name&owner_phone帶入，在確認時，將資料傳送到後端更改此筆資料
  $('#edit-moto').on('click', async function (event) {
    event.preventDefault();
    const motoId = $('#id').text();
    const license_no = $('#license_no').text();
    const owner_name = $('#owner_name').text();
    const owner_phone = $('#owner_phone').text();
    const owner_birthmonth = $('#owner_birthmonth').text();
    const owner_birthday = $('#owner_birthday').text();
    const birthmonthOptionsString = Array.from(Array(12)).reduce((acc, _, index) => {
      const month = index + 1;
      const selected = month === Number(owner_birthmonth) ? 'selected' : '';
      return acc + `<option value="${month}" ${selected}>${month}</option>`;
    }, '');
    const birthdayOptionsString = Array.from(Array(31)).reduce((acc, _, index) => {
      const day = index + 1;
      const selected = day === Number(owner_birthday) ? 'selected' : '';
      return acc + `<option value="${day}" ${selected}>${day}</option>`;
    }, '');
    const { value: formValues } = await Swal.fire({
      title: '更新客戶資料',
      html: `
            <div class="p-3 m-0">
              <div class="form-floating mb-3">
                <input id="new_owner_name" class="form-control" value="${owner_name}">
                <label for="floatingInput">顧客稱呼</label>
              </div>
              <div class="form-floating mb-3">
                <input id="new_owner_phone" class="form-control" value="${owner_phone}">
                <label for="floatingInput">顧客電話(選填)</label>
              </div>
              <div class="row">
                <div class="col-sm-6">
                  <div class="form-floating mb-3">
                    <select id="new_owner_birthmonth" class="form-select" placeholder="出生月(選填)">
                      <option value="0" ${owner_birthmonth ? 'selected' : ''}>不提供</option>
                      ${birthmonthOptionsString} 
                    </select>
                    <label for="floatingInput">出生月(選填)</label>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-floating mb-3">
                    <select id="new_owner_birthday" class="form-select" placeholder="出生日(選填)">
                      <option value="0" ${owner_birthday ? 'selected' : ''}>不提供</option>
                      ${birthdayOptionsString}
                    </select>
                    <label for="floatingInput">出生日(選填)</label>
                  </div>
                </div>
              </div>
            </div>
            `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const owner_name = document.getElementById('new_owner_name').value;
        const owner_phone = document.getElementById('new_owner_phone').value;
        const owner_birthmonth = document.getElementById('new_owner_birthmonth').value;
        const owner_birthday = document.getElementById('new_owner_birthday').value;
        if (!owner_name) {
          Swal.showValidationMessage(`請輸入顧客稱呼`);
        } else {
          $.ajax({
            type: 'PUT',
            url: `/moto/${motoId}`,
            data: { license_no, owner_name, owner_phone, owner_birthmonth, owner_birthday },
            success: function (data) {
              let timerInterval;
              Swal.fire({
                title: '更新用戶成功！',
                text: '即將跳轉',
                timer: 1000,
                icon: 'success',
                timerProgressBar: true,
                didOpen: () => Swal.showLoading(),
                willClose: () => clearInterval(timerInterval),
              }).then((result) => {
                /* Read more about handling dismissals below */
                if (result.dismiss === Swal.DismissReason.timer) {
                  console.log('I was closed by the timer');
                  window.location.href = `/moto/${license_no}`;
                }
              });
            },
            error: async (xhr, status, error) => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `更新用戶失敗：${xhr.responseJSON.message}`,
              });
            },
          });
        }
      },
    });
  });
  /*-------------------------------------------------------------------------*/
  // 取得所有用戶，並且將用戶資料放入userLists中
  const userLists = [];
  let isOpened = false; // 記錄選擇器是否已經打開，是否已經載入過user
  function getAllUsers() {
    return new Promise((resolve, reject) => {
      if (isOpened) return resolve(userLists);
      $.ajax({
        type: 'GET',
        url: `/profile`,
        success: function ({ data }) {
          const { users = [] } = data;
          userLists.push(...users);
          isOpened = true;
          resolve(userLists);
        },
        error: function (error) {
          console.log(error);
          reject(error);
        },
      });
    });
  }

  /*-------------------------------------------------------------------------*/
  // class = edit-record的按鈕被點擊時，用他的data-record-index attribute去判別是在moto.records中的第幾個record，知道了之後就跳出Swal視窗，並且將自動帶入record中的資訊，確認後，將資料傳送到後端更改此筆資料
  $('.edit-record').on('click', async function (event) {
    event.preventDefault();
    const record_index = event.currentTarget.getAttribute('data-record-index');
    const record = moto.records[record_index];
    const { _id: recordId, action, served_by, message, price } = record;
    const users = await getAllUsers();
    const usersOptionsString = users
      .map(
        (user) =>
          `<option value="${user._id}" ${served_by._id === user._id ? 'selected' : ''}>${user.username}</option>`,
      )
      .join('');
    const serviceOptionsString = Object.keys(MOTOSERVICE_TYPE)
      .map((key) => `<option value="${key}" ${action === key ? 'selected' : ''}>${SERVICE_TYPE[key]}</option>`)
      .join('');

    const license_no = $('#license_no').text();
    const { value: formValues } = await Swal.fire({
      title: '更新紀錄',
      html: `
            <div class="p-3 m-0">
              <div class="form-floating mb-3">
                <select id="new_action" class="form-select" placeholder="服務類型">${serviceOptionsString}</select>
                <label for="floatingInput">服務類型</label>
              </div>
              <div class="form-floating mb-3">
                <input id="new_price" type="number" class="form-control" placeholder="消費金額" value="${price}" min="0">
                <label for="floatingInput">消費金額</label>
              </div>
              <div class="form-floating mb-3">
                <select id="user-select" class="form-select">${usersOptionsString}</select>
                <label for="floatingInput">服務人員</label>
              </div>
              <div class="form-floating mb-3">
                <textarea id="new_message" class="form-control" placeholder="服務內容" style="height: 100px">${message}</textarea>
                <label for="floatingInput">服務內容</label>
              </div>
            </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const action = document.getElementById('new_action').value;
        const message = document.getElementById('new_message').value;
        const price = document.getElementById('new_price').value;
        const server = document.getElementById('user-select').value;
        if (!message) {
          Swal.showValidationMessage(`請輸入服務內容`);
        } else {
          $.ajax({
            type: 'PUT',
            url: `/record/${recordId}`,
            data: { action, record_index, message, price, server },
            success: function (data) {
              let timerInterval;
              Swal.fire({
                title: '更新紀錄成功！',
                text: '即將跳轉',
                icon: 'success',
                timer: 1000,
                timerProgressBar: true,
                didOpen: () => Swal.showLoading(),
                willClose: () => clearInterval(timerInterval),
              }).then((result) => {
                /* Read more about handling dismissals below */
                if (result.dismiss === Swal.DismissReason.timer) {
                  window.location.href = `/moto/${license_no}`;
                }
              });
            },
            error: async (xhr, status, error) => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `更新紀錄失敗：${xhr.responseJSON.message}`,
              });
            },
          });
        }
      },
    });
  });
  /*-------------------------------------------------------------------------*/
  // class = delete-record的按鈕被點擊時，用他的data-record-index attribute去判別是在moto.records中的第幾個record，知道了之後就跳出Swal視窗，確認使用者真的要刪除這筆record嗎？確認後，將資料傳送到後端更改此筆資料
  $('.delete-record').on('click', async function (event) {
    event.preventDefault();
    const record_index = event.currentTarget.getAttribute('data-record-index');
    const record = moto.records[record_index];
    const { _id: recordId, action, served_by, message, price } = record;
    const license_no = $('#license_no').text();
    const { value: formValues } = await Swal.fire({
      title: '刪除紀錄',
      text: '確定要刪除這筆紀錄嗎？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        $.ajax({
          type: 'DELETE',
          url: `/record/${recordId}`,
          success: function (data) {
            let timerInterval;
            Swal.fire({
              title: '刪除紀錄成功！',
              text: '即將跳轉',
              icon: 'success',
              timer: 1000,
              timerProgressBar: true,
              didOpen: () => Swal.showLoading(),
              willClose: () => clearInterval(timerInterval),
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
                window.location.href = `/moto/${license_no}`;
              }
            });
          },
          error: async (xhr, status, error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: `刪除紀錄失敗: ${xhr.responseJSON.message}`,
            });
          },
        });
      },
    });
  });
});
