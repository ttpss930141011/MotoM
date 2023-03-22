const Joi = require('joi');
const { JoiObjectId } = require('../../helpers/validator');
module.exports = {
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  find: Joi.object()
    .keys({
      license_no: Joi.string().required(),
    })
    .unknown(true),
  create: Joi.object()
    .keys({
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional(),
    })
    .unknown(true),
  put: Joi.object()
    .keys({
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional(),
    })
    .unknown(true),
  patchRecords: Joi.object()
    .keys({
      id: JoiObjectId().required(),
      action: Joi.string().required(),
      message: Joi.string().required(),
      price: Joi.number().required().min(0),
    })
    .unknown(true),
};
