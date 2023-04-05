$(document).ready(async function () {
  /*----------------- Data intialization -----------------*/
  // today 00:00:00
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

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
  // intialization progress
  updatedWorkTime();
  setInterval(() => updatedWorkTime(), 1000);
  // initial render revenue data
  const { data: revenueData = [] } = await getMonthlyRevenueData({
    month: selectedDate.getMonth() + 1,
    year: selectedDate.getFullYear(),
  });
  let { data: dailyRecoeds = [] } = await getDailyRecoedsData({ date: selectedDate });
  const { data: dailyRevenue } = await getDailyRevenueData({ date: selectedDate });
  const isOpenData = revenueData?.map((item) => {
    // dateString format = 'YYYY-MM-DD'
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const dateString = `${year}-${month}-${day}`;
    if (item.is_open) {
      return {
        date: dateString,
        classname: 'text-success',
        markup: `<div class="badge rounded-pill bg-success">[day]</div>`,
      };
    } else {
      return {
        date: dateString,
        classname: 'text-danger',
        markup: `<div class="badge rounded-pill bg-danger">[day]</div>`,
      };
    }
  });
  renderRevenueData(revenueData);
  renderDailyRevenueData(dailyRevenue);

  /*----------------- Event binding -----------------*/
  /*----------------- 日期選擇器 -----------------*/
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
    events: isOpenData,
  });

  calendar.on('zabuto:calendar:day', async function (e) {
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
    const { data } = await getDailyRevenueData({ date: day });
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
    // 重新渲染 daily revenue chart
    dailyRevenueTypeChart(data);
    // 重新渲染 daily records table
    const { data:updatedDailyRecoeds = [] } = await getDailyRecoedsData({ date: selectedDate });
    $('#service-table').DataTable().clear().rows.add(updatedDailyRecoeds).draw();
  });

  calendar.on('zabuto:calendar:goto', async ({ month, year }) => {
    const { data: revenueData = [] } = await getMonthlyRevenueData({ month, year });
    renderRevenueData(revenueData);
  });
  $.noConflict();
  $('#service-table').DataTable({
    scrollY: '200px',
    scrollCollapse: true,
    paging: false,
    data: dailyRecoeds,
    columns: [
      { data: 'id' },
      { data: 'license_no' },
      { data: 'owner_name' },
      { data: 'action' },
      { data: 'price' },
      { data: 'createdAt' },
    ],
  });
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
  /*------------------- 畫圖 -------------------*/

  // 當日收入類型折線柱狀圖
  // 累積營收為line，各項類別為bar
  async function dailyRevenueTypeChart(data) {
    const { type_revenue = {} } = data;
    console.log(type_revenue);
    console.log(Object.keys(type_revenue).map((item) => MOTOSERVICE_TYPE[item]));
    const inCome = Object.values(type_revenue);
    const accumulatedIncome = inCome.reduce((acc, cur) => {
      acc.push(cur + (acc[acc.length - 1] || 0));
      return acc;
    }, []);
    const option = {
      title: {
        text: '當日收入類型',
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
      legend: {
        data: ['收入', '累積收入'],
      },
      xAxis: [
        {
          type: 'category',
          data: Object.keys(type_revenue).map((item) => MOTOSERVICE_TYPE[item]),
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            interval: 0,
            formatter: function (value, index) {
              if (index % 2 != 0) {
                return '\n\n' + value;
              } else {
                return value;
              }
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '收入',
          axisLabel: {
            formatter: '{value} 元',
          },
        },
      ],
      series: [
        {
          name: '收入',
          type: 'bar',
          data: inCome,
        },
        {
          name: '累積收入',
          type: 'line',
          data: accumulatedIncome,
        },
      ],
    };
    // 檢查是否已生成過圖表，若有則先清除
    if (echarts.getInstanceByDom(document.getElementById('daily-revenue-type-chart'))) {
      echarts.getInstanceByDom(document.getElementById('daily-revenue-type-chart')).dispose();
    }
    const dailyRevenueTypeChart = echarts.init(document.getElementById('daily-revenue-type-chart'));
    dailyRevenueTypeChart.setOption(option);
    window.addEventListener('resize', dailyRevenueTypeChart.resize);
  }

  // 切換月份會自動更新當月收入圖表
  async function daysEarningChart(data) {
    const { days, total_revenue, cumulative_revenue, new_motos, total_motos_cumulative } = data;
    // '當月累加收入', '當月收入' 為左邊的line，'當月新車數', '當月累加車數' 為右邊的bar
    const option = {
      title: {
        text: '當月收入',
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

      legend: {
        data: ['當月累加收入', '當月收入', '當月新車數', '當月累加車數'],
        width: '70%',
        left: 'right',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: days,
        axisPointer: {
          type: 'shadow',
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '收入',
          axisLabel: {
            formatter: '{value} 元',
          },
        },
        {
          type: 'value',
          name: '車數',
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
          name: '當月收入',
          type: 'line',
          data: total_revenue,
        },
        {
          name: '當月新車數',
          type: 'bar',
          yAxisIndex: 1,
          data: new_motos,
        },
        {
          name: '當月累加車數',
          type: 'bar',
          yAxisIndex: 1,
          data: total_motos_cumulative,
        },
      ],
      dataZoom: [
        {
          orient: 'horizontal',
          show: this.zoomShow,
          realtime: true,
          height: 15,
          start: 0,
          end: this.endValue,
          bottom: '4%',
          zoomLock: true,
        },
        {
          type: 'inside',
          brushSelect: true,
          start: 0,
          end: 100,
          xAxisIndex: [0],
        },
      ],
    };
    // 檢查是否已生成過圖表，若有則先清除
    if (echarts.getInstanceByDom(document.getElementById('revenue-chart'))) {
      echarts.getInstanceByDom(document.getElementById('revenue-chart')).dispose();
    }
    const revenueChart = echarts.init(document.getElementById('revenue-chart'));
    revenueChart.setOption(option);
    window.addEventListener('resize', revenueChart.resize);
  }

  // 切換月份會自動更新當月收入類型圖表
  async function daysEarningTypeChart(data) {
    const { days, type_revenue, total_type_revenue } = data;
    const option = {
      title: {
        text: '當月收入類型',
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
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      legend: {
        data: Object.values(MOTOSERVICE_TYPE),
        width: '70%',
        // 靠右邊
        left: 'right',
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
      ],
      series: Object.keys(MOTOSERVICE_TYPE).map((type) => ({
        name: MOTOSERVICE_TYPE[type],
        type: 'bar',
        data: total_type_revenue[type],
      })),
      dataZoom: [
        {
          orient: 'horizontal',
          show: this.zoomShow,
          realtime: true,
          height: 15,
          start: 0,
          end: this.endValue,
          bottom: '4%',
          zoomLock: true,
        },
        {
          type: 'inside',
          brushSelect: true,
          start: 0,
          end: 100,
          xAxisIndex: [0],
        },
      ],
    };
    // 檢查是否已生成過圖表，若有則先清除
    if (echarts.getInstanceByDom(document.getElementById('revenue-type-chart'))) {
      echarts.getInstanceByDom(document.getElementById('revenue-type-chart')).dispose();
    }
    const revenueTypeChart = echarts.init(document.getElementById('revenue-type-chart'));
    revenueTypeChart.setOption(option);
    window.addEventListener('resize', revenueTypeChart.resize);
  }
  // 切換月份會自動更新當月收入類型圓餅圖
  async function daysEarningTypePieChart(data) {
    const { total_type_revenue } = data;
    option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        left: 'center',
      },

      series: [
        {
          name: '當月收入類型',
          type: 'pie',
          radius: ['10%', '80%'],
          top: '20%',
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: Object.keys(MOTOSERVICE_TYPE).map((type) => ({
            value: total_type_revenue[type].reduce((a, b) => a + b, 0),
            name: MOTOSERVICE_TYPE[type],
          })),
        },
      ],
    };
    // 檢查是否已生成過圖表，若有則先清除
    if (echarts.getInstanceByDom(document.getElementById('revenue-type-pie-chart'))) {
      echarts.getInstanceByDom(document.getElementById('revenue-type-pie-chart')).dispose();
    }
    const revenueTypePieChart = echarts.init(document.getElementById('revenue-type-pie-chart'));
    revenueTypePieChart.setOption(option);
    window.addEventListener('resize', revenueTypePieChart.resize);
  }

  /*------------------- utils -------------------*/
  // render revenue data
  function renderRevenueData(revenueData) {
    if (revenueData.length === 0) {
      // 三張圖表表示無資料
      $('#revenue-chart')
        .html('<div id="nodata" style="text-align: center;height:300px;line-height: 300px">無資料...</div>')
        .removeAttr('_echarts_instance_');
      $('#revenue-type-chart')
        .html('<div id="nodata" style="text-align: center;height:300px;line-height: 300px">無資料...</div>')
        .removeAttr('_echarts_instance_');
      $('#revenue-type-pie-chart')
        .html('<div id="nodata" style="text-align: center;height:300px;line-height: 300px">無資料...</div>')
        .removeAttr('_echarts_instance_');
      return;
    }
    // 有資料
    const chartData = revenueDateToEchartData(revenueData);
    daysEarningChart(chartData);
    daysEarningTypeChart(chartData);
    daysEarningTypePieChart(chartData);
  }
  function renderDailyRevenueData(dailyRevenueData) {
    if (Object.keys(dailyRevenueData).length === 0) {
      $('#daily-revenue-type-chart')
        .html('<div id="nodata" style="text-align: center;height:300px;line-height: 300px">無資料...</div>')
        .removeAttr('_echarts_instance_');
      return;
    }
    dailyRevenueTypeChart(dailyRevenueData);
  }
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

  function updateOpenSwal() {
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
  }
  // ajas 取得當日的收入資料
  async function getDailyRevenueData({ date }) {
    if (!date) return;
    const response = await $.ajax({
      url: `/revenue?date=${date}`,
      type: 'GET',
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
  }
  // ajax 取得當天服務資料
  async function getDailyRecoedsData({ date }) {
    if (!date) return;
    const response = await $.ajax({
      url: `/record?date=${date}`,
      type: 'GET',
      success: function (data) {
        return data;
      },
      error: async (xhr, status, error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `取得服務資料失敗：${xhr.responseJSON.message}`,
        });
      },
    });
    return response;
  }
  // ajax取得當月的收入資料
  async function getMonthlyRevenueData({ month, year }) {
    if (!month || !year) return;
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
  }

  function revenueDateToEchartData(data = []) {
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

    const total_type_revenue = Object.keys(MOTOSERVICE_TYPE).reduce((acc, cur) => {
      acc[cur] = type_revenue.map((day) => day[cur]);
      return acc;
    }, {});
    const new_motos = data.map((day) => day.new_motos.length);
    const total_motos = data.map((day) => day.total_motos.length);

    const total_motos_cumulative = total_motos.reduce((acc, cur) => {
      acc.push(cur + (acc[acc.length - 1] || 0));
      return acc;
    }, []);
    return {
      days,
      total_revenue,
      cumulative_revenue,
      type_revenue,
      new_motos,
      total_motos,
      total_type_revenue,
      total_motos_cumulative,
    };
  }
  /*----------------------------------------------*/
});
