const express = require('express');
const router = express.Router();
const passport = require('passport');
const { validator } = require('../../helpers/validator');
const schema = require('./schema');
const { SuccessResponse } = require('../../core/ApiResponse');
router.get('/', function (req, res) {
  res.render('login', { title: 'Login' });
});

// 設定/login路由
router.post('/', validator(schema.login), passport.authenticate('local'), (req, res) => {
  console.log('login success', req.user);
  return new SuccessResponse('success', { message: 'login success' }).send(res);
});

module.exports = router;
