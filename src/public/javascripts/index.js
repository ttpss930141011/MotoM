$(function () {
  (() => {
    'use strict';
    dayjs().format();
    document.querySelector('#navbarSideCollapse').addEventListener('click', () => {
      document.getElementById('collapse-nav').classList.toggle('open');
    });
    document.querySelector('main').addEventListener(
      'click',
      (event) => {
        const navCollapse = document.getElementById('collapse-nav');
        if (navCollapse.classList.contains('open') && !event.target.matches('.offcanvas-collapse, .navbar-toggler')) {
          navCollapse.classList.remove('open');
        }
      },
      true,
    );
  })();
});
