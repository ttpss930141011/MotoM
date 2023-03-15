const express = require('express');
const authentication = require('../../auth/authentication');
const { validator } = require('../../helpers/validator');
const schema = require('./schema');
const { SuccessResponse } = require('../../core/ApiResponse');
const { BadRequestError } = require('../../core/ApiError');
const MotoRepo = require('../../database/repository/MotoRepo');
const asyncHandler = require('../../helpers/asyncHandler');
const router = express.Router();
const _ = require('lodash');
/* GET home page. */
router.get('/', authentication, function (req, res, next) {
  res.render('search', { title: 'Express' });
});

// license_no form submit
router.post(
  '/',
  validator(schema.license_no),
  authentication,
  asyncHandler(async (req, res, next) => {
    const { license_no } = req.body;
    if (!license_no) throw new BadRequestError(err);
    const moto = await MotoRepo.findByLicenseNo(license_no);
    if (_.isEmpty(moto)) throw new BadRequestError('not found');
    return new SuccessResponse('success', { moto }).send(res);
  }),
);

module.exports = router;
