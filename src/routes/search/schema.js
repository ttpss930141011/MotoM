const Joi = require('joi');

module.exports = {
  license_no: Joi.object()
    .keys({
      license_no: Joi.string().required(),
    })
    .unknown(true),
};
