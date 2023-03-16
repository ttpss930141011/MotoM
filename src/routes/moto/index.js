const express = require('express');
const router = express.Router();
const MotoRepo = require('../../database/repository/MotoRepo');
const schema = require('./schema');
const { BadRequestError } = require('../../core/ApiError');
const { SuccessResponse } = require('../../core/ApiResponse');
const asyncHandler = require('../../helpers/asyncHandler');
const _ = require('lodash');
const { validator } = require('../../helpers/validator');
const authentication = require('../../auth/authentication');

// 客戶列表頁面路由
router.get('/', (req, res) => {
  res.render('customers', { title: 'Customers' });
});

router.post(
  '/',
  validator(schema.create),
  authentication,
  asyncHandler(async (req, res, next) => {
    const { license_no, owner_name, owner_phone = '' } = req.body;
    if (!license_no || !owner_name) throw new BadRequestError(err);
    const moto = await MotoRepo.findByLicenseNo(license_no);
    if (!_.isEmpty(moto)) throw new BadRequestError('license_no already exists');
    const createdMoto = await MotoRepo.create({ license_no, owner_name, owner_phone });
    console.log(createdMoto);
    return new SuccessResponse('success', createdMoto).send(res);
  }),
);
// 單一客戶詳細資料頁面路由
// router.get('/customers/:id', customers.show);

// 新增客戶頁面路由
// router.get('/customers/new', customers.new);

module.exports = router;
