const Joi = require('joi');
const { JoiObjectId } = require('../../helpers/validator');
module.exports = {
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
  update: Joi.object()
    .keys({
      id: JoiObjectId().required(),
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional(),
    })
    .unknown(true),
};
