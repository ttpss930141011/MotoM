const express = require('express');
const router = express.Router();
const MotoRepo = require('../../database/repository/MotoRepo');
const RecordRepo = require('../../database/repository/RecordRepo');
const schema = require('./schema');
const { BadRequestError } = require('../../core/ApiError');
const { SuccessResponse } = require('../../core/ApiResponse');
const asyncHandler = require('../../helpers/asyncHandler');
const _ = require('lodash');
const { validator, ValidationSource } = require('../../helpers/validator');
const authentication = require('../../auth/authentication');
const dayjs = require('dayjs');

// 客戶列表頁面路由
router.get(
  '/:license_no',
  validator(schema.find, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const moto = await MotoRepo.findByLicenseNo(req.params.license_no);
    if (_.isEmpty(moto)) throw new BadRequestError('not found');
    console.log(moto);
    moto.updatedAt = dayjs(moto.updatedAt).locale('zh-tw').format('YYYY/MM/DD HH:mm:ss');
    moto.createdAt = dayjs(moto.createdAt).locale('zh-tw').format('YYYY/MM/DD HH:mm:ss');
    res.render('moto', { moto });
  }),
);

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
    const createdRecord = await RecordRepo.create({
      moto_id: createdMoto._id,
      action: 'CREATED',
      served_by: req.user._id,
      message: `建立了車牌號碼為 ${license_no} 的車輛資料`,
    });
    const updatedMoto = await MotoRepo.updateRecord(createdMoto._id, createdRecord._id);
    return new SuccessResponse('success', updatedMoto).send(res);
  }),
);

router.put(
  '/license_no/:license_no',
  validator(schema.update),
  asyncHandler(async (req, res) => {
    const { license_no } = req.params;
    const { owner_name, owner_phone = '', id } = req.body;
    const updatedMoto = await MotoRepo.update({ _id: id, license_no, owner_name, owner_phone });
    console.log(updatedMoto);
    return new SuccessResponse('success', updatedMoto).send(res);
  }),
);

// 單一客戶詳細資料頁面路由
// router.get('/customers/:id', customers.show);

// 新增客戶頁面路由
// router.get('/customers/new', customers.new);

module.exports = router;
