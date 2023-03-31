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
  // owner_phone 可以為空
  create: Joi.object()
    .keys({
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional().allow(null, ''),
      owner_birthmonth: Joi.number().optional().allow(null, ''),
      owner_birthday: Joi.number().optional().allow(null, ''),
    })
    .unknown(true),
  put: Joi.object()
    .keys({
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional().allow(null, ''),
      owner_birthmonth: Joi.number().optional().allow(null, ''),
      owner_birthday: Joi.number().optional().allow(null, ''),
    })
    .unknown(true),
};
