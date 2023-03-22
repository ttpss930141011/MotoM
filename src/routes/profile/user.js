const express = require('express');
const UsersModel = require('../../database/repository/UserRepo');
const asyncHandler = require('../../helpers/asyncHandler');
const { SuccessResponse } = require('../../core/ApiResponse');

const router = express.Router();

// 取得所有user
router.get('/', asyncHandler(async (req, res, next) => {
  const users = await UsersModel.findAllUsername();
  return new SuccessResponse('success', { users }).send(res);
}));
module.exports = router;
