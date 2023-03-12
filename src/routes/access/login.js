const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', function (req, res) {
  res.render('login', { title: 'Login', message: null });
});

// 設定/login路由
router.post(
  '/',
  passport.authenticate('local', { failureRedirect: '/access/login' }),
  // 驗證成功時，將呼叫此函式，且 req.user 將帶有該使用者資訊
  function (req, res) {
    console.log('login success', req.user);
    res.redirect('/');
  },
);

module.exports = router;
