const express = require('express');
const router = express.Router();
const passport = require('passport');
const { validator } = require('../../helpers/validator');
const schema = require('./schema');
const { SuccessResponse } = require('../../core/ApiResponse');
const { BadRequestError } = require('../../core/ApiError');

router.get('/', function (req, res) {
  res.render('register', { title: 'Register', message: req.flash('info') });
});

router.post('/', validator(schema.register), passport.authenticate('register'), (req, res) => {
  req.login(req.user, (err) => {
    if (err) return new BadRequestError(err);
    return new SuccessResponse('success', { message: 'login success' }).send(res);
  });
});

module.exports = router;
