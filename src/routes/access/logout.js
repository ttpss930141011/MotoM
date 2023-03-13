const express = require('express');
const router = express.Router();
const authentication = require('../../auth/authentication');
const { SuccessResponse } = require('../../core/ApiResponse');
const { BadRequestError } = require('../../core/ApiError');
// 設定/logout路由

router.post('/', authentication, (req, res, next) => {
  req.logout(function (err) {
    if (err) return new BadRequestError(err);
    return new SuccessResponse('success', { message: 'logout success' }).send(res);
  });
});

module.exports = router;
