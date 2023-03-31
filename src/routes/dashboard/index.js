const express = require('express');
const authentication = require('../../auth/authentication');
const apikey = require('../../auth/apikey');
const permission = require('../../helpers/permission');
const { Permission } = require('../../database/model/ApiKey');
const RevenueRepo = require('../../database/repository/RevenueRepo');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const { BadRequestError } = require('../../core/ApiError');
const { SuccessResponse } = require('../../core/ApiResponse');
const { validator, ValidationSource } = require('../../helpers/validator');
const schema = require('./schema');

/* GET home page. */
router.get(
  '/',
  authentication,
  asyncHandler(async (req, res, next) => {
    // 今天日期
    const date = new Date().setHours(0, 0, 0, 0);
    const revenue = await RevenueRepo.findOneByDateAndUpsert({ date });
    // 將start_work_time從Date轉成hh:mm
    const start_work_time = new Date(revenue.start_work_time);
    const end_work_time = new Date(revenue.end_work_time);
    const start_work_time_hh = `0${start_work_time.getHours()}`.slice(-2);
    const start_work_time_mm = `0${start_work_time.getMinutes()}`.slice(-2);
    const end_work_time_hh = `0${end_work_time.getHours()}`.slice(-2);
    const end_work_time_mm = `0${end_work_time.getMinutes()}`.slice(-2);
    revenue.start_work_time = `${start_work_time_hh}:${start_work_time_mm}`;
    revenue.end_work_time = `${end_work_time_hh}:${end_work_time_mm}`;
    res.render('index', { revenue });
  }),
);

// 更改上下班時間
router.put(
  '/worktime',
  authentication,
  validator(schema.worktime),
  asyncHandler(async (req, res, next) => {
    const { date, start_work_time, end_work_time } = req.body;
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    const revenue = await RevenueRepo.findOneByDateAndUpsert({
      date: dateTime,
      start_work_time: new Date(start_work_time),
      end_work_time: new Date(end_work_time),
    });
    return new SuccessResponse('success', revenue).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use(apikey);
/*-------------------------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
module.exports = router;
