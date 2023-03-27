$(document).ready(function () {
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
});
