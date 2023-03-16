const Joi = require('joi');

module.exports = {
  create: Joi.object()
    .keys({
      license_no: Joi.string().required(),
      owner_name: Joi.string().required(),
      owner_phone: Joi.string().optional(),
    })
    .unknown(true),
};
