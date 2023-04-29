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
  validator(schema.getdate, ValidationSource.QUERY),
  asyncHandler(async (req, res, next) => {
    // 今天日期
    const date = new Date(req.query.date);
    date.setHours(0, 0, 0, 0);
    const revenue = await RevenueRepo.getRevenueByDate(date);
    if (!revenue) throw new BadRequestError('查無此日期');
    const start_work_time = new Date(revenue.start_work_time);
    const end_work_time = new Date(revenue.end_work_time);
    const start_work_time_hh = `0${start_work_time.getHours()}`.slice(-2);
    const start_work_time_mm = `0${start_work_time.getMinutes()}`.slice(-2);
    const end_work_time_hh = `0${end_work_time.getHours()}`.slice(-2);
    const end_work_time_mm = `0${end_work_time.getMinutes()}`.slice(-2);
    revenue.start_work_time = `${start_work_time_hh}:${start_work_time_mm}`;
    revenue.end_work_time = `${end_work_time_hh}:${end_work_time_mm}`;
    return new SuccessResponse('success', revenue).send(res);
  }),
);

router.get(
  '/month',
  validator(schema.getdateByMonth, ValidationSource.QUERY),
  authentication,
  asyncHandler(async (req, res, next) => {
    const { month, year } = req.query;
    const revenue = await RevenueRepo.getRevenueByMonth(month, year);
    return new SuccessResponse('success', revenue).send(res);
  }),
);

// 更改上下班時間
router.put(
  '/worktime',
  authentication,
  validator(schema.worktime),
  asyncHandler(async (req, res, next) => {
    const { date, start_work_time, end_work_time } = req.body;
    const dateTime = new Date(date);
    dateTime.setHours(0, 0, 0, 0);
    const revenue = await RevenueRepo.findOneByDateAndUpsert({
      date: dateTime,
      start_work_time: new Date(start_work_time),
      end_work_time: new Date(end_work_time),
    });
    return new SuccessResponse('success', revenue).send(res);
  }),
);

// 更新 RevenueRepo is_open 的值
router.patch(
  '/is_open',
  authentication,
  asyncHandler(async (req, res, next) => {
    const { date, is_open } = req.body;
    const dateTime = new Date(date);
    dateTime.setHours(0, 0, 0, 0);
    const revenue = await RevenueRepo.findOneByDateAndUpsert({
      date: dateTime,
      is_open,
    });
    return new SuccessResponse('success', revenue).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
// router.use(apikey);
/*-------------------------------------------------------------------------*/
/*---------------------------------------------------------*/
// router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
module.exports = router;
