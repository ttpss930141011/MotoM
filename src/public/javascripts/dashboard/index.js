$(document).ready(function () {
  // today 00:00:00
  const selectedDate = new Date().setHours(0, 0, 0, 0);

  const calendar = $('#calendar');
  calendar.zabuto_calendar({
    week_starts: 'sunday',
    show_days: true,
    translation: {
      months: {
        1: '一月',
        2: '二月',
        3: '三月',
        4: '四月',
        5: '五月',
        6: '六月',
        7: '七月',
        8: '八月',
        9: '九月',
        10: '十月',
        11: '十一月',
        12: '十二月',
      },
      days: {
        0: '日',
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
      },
    },
    today_markup: '<span class="badge bg-primary">[day]</span>',
    classname: 'table table-bordered clickable',
    navigation_markup: {
      prev: '<i class="bi bi-chevron-left"></i>',
      next: '<i class="bi bi-chevron-right"></i>',
    },
  });

  // 取得 id=start_work_time 的值，

  const startTime = $('#start_work_time').text().split(':'); // 將值以':'分割，並存入startTime陣列中
  const endTime = $('#end_work_time').text().split(':'); // 將值以':'分割，並存入endTime陣列中
  const startTimestamps = new Date();
  startTimestamps.setHours(Number(startTime[0]), Number(startTime[1]), 0); // 設定start時間為早上9點
  const endTimestamps = new Date();
  endTimestamps.setHours(Number(endTime[0]), Number(endTime[1]), 0); // 設定end時間為晚上21點

  const totalTime = endTimestamps.getTime() - startTimestamps.getTime(); // 總時長（毫秒）
  const elapsedTime = new Date().getTime() - startTimestamps.getTime(); // 已經過的時間（毫秒）
  // 計算進度百分比（向下取整），最大為100
  const progress = getProgress(elapsedTime, totalTime);

  const formattedTime = formatTime(elapsedTime);
  $('#progress-num').text(progress + '%');
  $('#progress-bar').css('width', progress + '%');
  $('#progress-text').text(formattedTime);

  // 每一秒去更新 id = progress-num id=progress-bar 的style width = progress + '%'，id = progress-text 則為 elapsedTime 以hh:mm:ss的格式顯示
  setInterval(function () {
    const elapsedTime = new Date().getTime() - startTimestamps.getTime(); // 已經過的時間（毫秒）
    const formattedTime = formatTime(elapsedTime);
    const progress = getProgress(elapsedTime, totalTime); // 計算進度百分比（向下取整）
    $('#progress-num').text(progress + '%');
    $('#progress-bar').css('width', progress + '%');
    $('#progress-text').text(formattedTime);
  }, 1000);

  // 將毫秒轉換為hh:mm:ss的格式
  function formatTime(time) {
    let hour = Math.floor(time / 3600000);
    let minute = Math.floor((time % 3600000) / 60000);
    let second = Math.floor(((time % 360000) % 60000) / 1000);
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;
    return hour + ':' + minute + ':' + second;
  }
  // 計算進度百分比（向下取整），最大為100，最小為0
  function getProgress(elapsedTime, totalTime) {
    const progress = Math.floor((elapsedTime / totalTime) * 100);
    if (progress > 100) {
      return 100;
    } else if (progress < 0) {
      return 0;
    } else {
      return progress;
    }
  }

  // 點擊id = setting-time的按鈕，彈出Swal視窗，並且將上下班時間的input的value設定為cookie中的值
  // 打put request去 /dashboard/worktime 路徑，將上下班時間的input的value與selectedDate傳到後端
  $('#setting-time').click(function () {
    Swal.fire({
      title: '設定上下班時間',
      html: `
      <div class="p-3 m-0">
        <div class="row p-1">
          <div class="col-6">
            <div class="form-floating mb-3">
              <input type="time" class="form-control" id="start-time" value="${startTime[0]}:${startTime[1]}">
              <label for="start-time">上班時間</label>
            </div>
          </div>
          <div class="col-6">
            <div class="form-floating mb-3">
              <input type="time" class="form-control" id="end-time" value="${endTime[0]}:${endTime[1]}">
              <label for="end-time">下班時間</label>
            </div>
          </div>
        </div>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const startTime = $('#start-time').val();
        const endTime = $('#end-time').val();
        const startTimeArray = startTime.split(':');
        const endTimeArray = endTime.split(':');
        const start_work_time = new Date();
        start_work_time.setHours(Number(startTimeArray[0]), Number(startTimeArray[1]), 0);
        const end_work_time = new Date();
        end_work_time.setHours(Number(endTimeArray[0]), Number(endTimeArray[1]), 0);
        document.cookie = `startTime=${startTimeArray[0]},${startTimeArray[1]};path=/`;
        document.cookie = `endTime=${endTimeArray[0]},${endTimeArray[1]};path=/`;
        return $.ajax({
          url: '/dashboard/worktime',
          type: 'PUT',
          data: {
            start_work_time,
            end_work_time,
            date: selectedDate,
          },
          success: function (data) {
            let timerInterval;
            Swal.fire({
              title: '更新時間成功！',
              text: '即將跳轉',
              timer: 1000,
              icon: 'success',
              timerProgressBar: true,
              didOpen: () => Swal.showLoading(),
              willClose: () => clearInterval(timerInterval),
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
                window.location.reload();
              }
            });
          },
          error: async (xhr, status, error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: `更新時間失敗：${xhr.responseJSON.message}`,
            });
          },
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  });
});
