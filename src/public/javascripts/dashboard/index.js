$(document).ready(function () {
  // today 00:00:00
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

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

  calendar.on('zabuto:calendar:day', function (e) {
    const day = new Date(e.date);
    day.setHours(0, 0, 0, 0);
    const today = new Date();
    selectedDate = new Date(day);
    // 若選擇日期大於今天，則不做任何事
    if (day.getTime() > today.getTime()) return;
    // 先把其他的日期背景色移除，再把選到的日期背景色加上
    $('#calendar td.zabuto-calendar__day').removeClass('bg-secondary text-white');
    $(e.element).addClass('bg-secondary text-white');
    // get revenue date
    $.ajax({
      url: `/revenue?date=${day}`,
      type: 'GET',
      success: function ({ data }) {
        $('#total_revenue').text(data.total_revenue);
        $('#total_motos').text(data.total_motos.length);
        $('#new_motos').text(data.new_motos.length);
        $('#start_work_time').text(data.start_work_time);
        $('#end_work_time').text(data.end_work_time);
        $('#is_open').text(data.is_open);
        // 如果 is_open 為 false，則將badge 文字改為休假，且顏色為紅色，否則文字改為營業中，顏色為綠色
        if (data.is_open) {
          $('#is_open_badge').removeClass('bg-danger').addClass('bg-success').text('營業');
        } else {
          $('#is_open_badge').removeClass('bg-success').addClass('bg-danger').text('休假');
        }
      },
      error: function (err) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.responseJSON.message,
        });
      },
    });
  });

  calendar.on('zabuto:calendar:goto', function (e) {
    console.log('zabuto:calendar:goto' + ' year=' + e.year + ' month=' + e.month);
  });
  // updatedWorkTime
  function updatedWorkTime() {
    const startTime = $('#start_work_time').text().split(':'); // 將值以':'分割，並存入startTime陣列中
    const endTime = $('#end_work_time').text().split(':'); // 將值以':'分割，並存入endTime陣列中
    // 深拷貝selectedDate，避免將selectedDate的值改變
    const startTimestamps = new Date(selectedDate);
    startTimestamps.setHours(Number(startTime[0]), Number(startTime[1])); // 設定start時間為早上9點
    const endTimestamps = new Date(selectedDate);
    endTimestamps.setHours(Number(endTime[0]), Number(endTime[1])); // 設定end時間為晚上21點
    const totalTime = endTimestamps.getTime() - startTimestamps.getTime(); // 總時長（毫秒）
    const elapsedTime = new Date().getTime() - startTimestamps.getTime(); // 已經過的時間（毫秒）
    const formattedTime = formatTime(elapsedTime);
    const progress = getProgress(elapsedTime, totalTime); // 計算進度百分比（向下取整）
    $('#progress-num').text(progress + '%');
    $('#progress-bar').css('width', progress + '%');
    $('#progress-text').text(formattedTime);
  }
  // intialization progress
  updatedWorkTime();
  setInterval(() => updatedWorkTime(), 1000);

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

  // 點擊id = setting-time的按鈕，彈出Swal視窗，內容為上下班時間的input，以及今天沒有上班的按鈕
  // 打put request去 /revenue/worktime 路徑，將上下班時間的input的value與selectedDate傳到後端
  $('#setting-time').click(function () {
    const startTime = $('#start_work_time').text().split(':');
    const endTime = $('#end_work_time').text().split(':');
    const is_open = $('#is_open').text() === 'true';
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
        <div class="or-seperator">
          <i>or</i>
        </div>
        <!-- 今天沒有上班按鈕 -->
        <div class="row p-1">
          <div class="col-12">
            ${
              is_open === true
                ? '<button type="button" class="btn btn-outline-danger w-100" id="is-work-toggle">今天沒有上班:D</button>'
                : '<button type="button" class="btn btn-outline-success w-100" id="is-work-toggle">今天有上班:(</button>'
            }
            
          </div>
        </div>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      didOpen: () => {
        $('#is-work-toggle').click(function () {
          updateOpenSwal();
        });
      },
      preConfirm: () => {
        const startTime = $('#start-time').val();
        const endTime = $('#end-time').val();
        const startTimeArray = startTime.split(':');
        const endTimeArray = endTime.split(':');
        const start_work_time = new Date();
        start_work_time.setHours(Number(startTimeArray[0]), Number(startTimeArray[1]), 0);
        const end_work_time = new Date();
        end_work_time.setHours(Number(endTimeArray[0]), Number(endTimeArray[1]), 0);
        return $.ajax({
          url: '/revenue/worktime',
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
  const updateOpenSwal = () => {
    // 點集id = no-work的按鈕，彈出Swal視窗，確認使用者是否要將今天設定為沒有上班，是的話打PATCH request去 /revenue/is_open 路徑，將is_open = false的value與selectedDate傳到後端
    const is_open = $('#is_open').text() === 'true';
    const updatedIsOpen = !is_open;
    Swal.fire({
      title: `確定今天${updatedIsOpen ? '有' : '沒有'}上班嗎？`,
      text: `將今日設定為${updatedIsOpen ? '有' : '沒有'}上班`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return $.ajax({
          url: '/revenue/is_open',
          type: 'PATCH',
          data: {
            is_open: updatedIsOpen,
            date: selectedDate,
          },
          success: function (data) {
            let timerInterval;
            Swal.fire({
              title: '今天沒有上班！',
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
  };

  // ajax取得當月的收入資料
  const getRevenueData = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const response = await $.ajax({
      url: '/revenue/month',
      type: 'GET',
      data: {
        year,
        month,
      },
      success: function (data) {
        return data;
      },
      error: async (xhr, status, error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `取得收入資料失敗：${xhr.responseJSON.message}`,
        });
      },
    });
    return response;
  };
  /*
    這是revenue的一天的資料格式，一個月有31天，所以一個月的資料就是31個這樣的物件
    
    { 
    "date" : ISODate("2023-04-03T16:00:00.000+0000"), 
    "createdAt" : ISODate("2023-04-04T02:44:49.175+0000"), 
    "new_motos" : [

    ], 
    "status" : true, 
    "total_motos" : [

    ], 
    "total_revenue" : NumberInt(0), 
    "type_revenue" : {
        "ACCESSORIES" : NumberInt(0), 
        "ACCIDENT" : NumberInt(0), 
        "CLAIMS" : NumberInt(0), 
        "INSPECTION" : NumberInt(0), 
        "INSURANCE" : NumberInt(0), 
        "MAINTAIN" : NumberInt(0), 
        "OTHER" : NumberInt(0), 
        "PARTS" : NumberInt(0), 
        "RENTAL" : NumberInt(0), 
        "REPAIR" : NumberInt(0), 
        "SALES" : NumberInt(0)
    }, 
    "updatedAt" : ISODate("2023-04-04T05:22:22.522+0000")
  } */
  // 將這一個月的資料生成echart的資料格式
  getRevenueData(selectedDate).then(({ data }) => {
    console.log(data);
    // days 取得格式為 mm/dd 的日期
    const days = data.map((day) => {
      const date = new Date(day.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const total_revenue = data.map((day) => day.total_revenue);
    // 當月累加收入
    const cumulative_revenue = total_revenue.reduce((acc, cur) => {
      acc.push(cur + (acc[acc.length - 1] || 0));
      return acc;
    }, []);
    const type_revenue = data.map((day) => day.type_revenue);
    const new_motos = data.map((day) => day.new_motos.length);
    const total_motos = data.map((day) => day.total_motos.length);
    console.log(new_motos);
    console.log(total_motos);
    const is_open = $('#is_open').text() === 'true';
    const daysEarning = echarts.init(document.getElementById('days-earning'), null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });
    // 當月累加收入為line，當天收入為line，新車為bar，總車輛為bar
    const daysEarningOption = {
      title: {
        text: '每日收入',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      grid: {
        left: '15%', // left padding
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ['當月累加收入', '當天收入', '新車', '總車輛'],
      },
      xAxis: [
        {
          type: 'category',
          data: days,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '收入',
          min: 0,
          axisLabel: {
            formatter: '{value} 元',
          },
        },
        {
          type: 'value',
          name: '車輛',
          min: 0,
          interval: 5,
          axisLabel: {
            formatter: '{value} 輛',
          },
        },
      ],
      series: [
        {
          name: '當月累加收入',
          type: 'line',
          data: cumulative_revenue,
        },
        {
          name: '當天收入',
          type: 'line',
          data: total_revenue,
        },
        {
          name: '新車',
          type: 'bar',
          data: new_motos,
          yAxisIndex: 1,
        },
        {
          name: '總車輛',
          type: 'bar',
          data: total_motos,
          yAxisIndex: 1,
        },
      ],
    };
    daysEarning.setOption(daysEarningOption);
    // const daysEarningType = echarts.init(document.getElementById('days-earning-type'), null, {
    //   renderer: 'canvas',
    //   useDirtyRect: false,
    // });
    // const daysEarningTypeOption = {
    //   title: {
    //     text: '每日收入類型',
    //   },
    //   tooltip: {
    //     trigger: 'axis',
    //     axisPointer: {
    //       type: 'cross',
    //       crossStyle: {
    //         color: '#999',
    //       },
    //     },
    //   },
    //   toolbox: {
    //     feature: {
    //       dataView: { show: true, readOnly: false },
    //       magicType: { show: true, type: ['line', 'bar'] },
    //       restore: { show: true },
    //       saveAsImage: { show: true },
    //     },
    //   },
    //   legend: {
    //     data: ['保險', '維修', '檢驗', '銷售', '其他'],
    //   },
    //   xAxis: [
    //     {
    //       type: 'category',
    //       data: days,
    //       axisPointer: {
    //         type: 'shadow',
    //       },
    //     },
    //   ],
    //   yAxis: [
    //     {
    //       type: 'value',
    //       name: '收入',
    //       min: 0,
    //       max: 100000,
    //       interval: 10000,
    //       axisLabel: {
    //         formatter: '{value} 元',
    //       },
    //     },
    //   ],
    //   series: [
    //     {
    //       name: '保險',
    //       type: 'bar',
    //       data: type_revenue.map((day) => day.INSURANCE),
    //     },
    //     {
    //       name: '維修',
    //       type: 'bar',
    //       data: type_revenue.map((day) => day.REPAIR),
    //     },
    //     {
    //       name: '檢驗',
    //       type: 'bar',
    //       data: type_revenue.map((day) => day.INSPECTION),
    //     },
    //     {
    //       name: '銷售',
    //       type: 'bar',
    //       data: type_revenue.map((day) => day.SALE),
    //     },
    //     {
    //       name: '其他',
    //       type: 'bar',
    //       data: type_revenue.map((day) => day.OTHER),
    //     },
    //   ],
    // };
    // daysEarningType.setOption(daysEarningTypeOption);
    // const daysEarningTypePie = echarts.init(document.getElementById('days-earning-type-pie'), null, {
    //   renderer: 'canvas',
    //   useDirtyRect: false,
    // });
    // const daysEarningTypePieOption = {
    //   title: {
    //     text: '每日收入類型',
    //   },
    //   tooltip: {
    //     trigger: 'item',
    //     formatter: '{a} <br/>{b}: {c} ({d}%)',
    //   },
    //   legend: {
    //     orient: 'vertical',
    //     x: 'left',
    //     data: ['保險', '維修', '檢驗', '銷售', '其他'],
    //   },
    //   series: [
    //     {
    //       name: '收入類型',
    //       type: 'pie',
    //       radius: ['50%', '70%'],
    //       avoidLabelOverlap: false,
    //       label: {
    //         normal: {
    //           show: false,
    //           position: 'center',
    //         },
    //         emphasis: {
    //           show: true,
    //           textStyle: {
    //             fontSize: '30',
    //             fontWeight: 'bold',
    //           },
    //         },
    //       },
    //       labelLine: {
    //         normal: {
    //           show: false,
    //         },
    //       },
    //       data: [
    //         { value: type_revenue[0].INSURANCE, name: '保險' },
    //         { value: type_revenue[0].REPAIR, name: '維修' },
    //         { value: type_revenue[0].INSPECTION, name: '檢驗' },
    //         { value: type_revenue[0].SALE, name: '銷售' },
    //         { value: type_revenue[0].OTHER, name: '其他' },
    //       ],
    //     },
    //   ],
    // };
    // daysEarningTypePie.setOption(daysEarningTypePieOption);
    // const daysEarningTypePie2 = echarts.init(document.getElementById('days-earning-type-pie2'), null, {
    //   renderer: 'canvas',
    //   useDirtyRect: false,
    // });
    // const daysEarningTypePie2Option = {
    //   title: {
    //     text: '每日收入類型',
    //   },
    //   tooltip: {
    //     trigger: 'item',
    //     formatter: '{a} <br/>{b}: {c} ({d}%)',
    //   },
    //   legend: {
    //     orient: 'vertical',
    //     x: 'left',
    //     data: ['保險', '維修', '檢驗', '銷售', '其他'],
    //   },
    //   series: [
    //     {
    //       name: '收入類型',
    //       type: 'pie',
    //       radius: ['50%', '70%'],
    //       avoidLabelOverlap: false,
    //       label: {
    //         normal: {
    //           show: false,
    //           position: 'center',
    //         },
    //         emphasis: {
    //           show: true,
    //           textStyle: {
    //             fontSize: '30',
    //             fontWeight: 'bold',
    //           },
    //         },
    //       },
    //       labelLine: {
    //         normal: {
    //           show: false,
    //         },
    //       },
    //       data: [
    //         { value: type_revenue[1].INSURANCE, name: '保險' },
    //         { value: type_revenue[1].REPAIR, name: '維修' },
    //         { value: type_revenue[1].INSPECTION, name: '檢驗' },
    //         { value: type_revenue[1].SALE, name: '銷售' },
    //         { value: type_revenue[1].OTHER, name: '其他' },
    //       ],
    //     },
    //   ],
    // };
    // daysEarningTypePie2.setOption(daysEarningTypePie2Option);

    window.addEventListener('resize', daysEarning.resize);
  });
});
