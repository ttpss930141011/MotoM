const Joi = require('joi');
const { JoiObjectId } = require('../../helpers/validator');
module.exports = {
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  date: Joi.object()
    .keys({
      date: Joi.date().required(),
    })
    .unknown(true),

  find: Joi.object()
    .keys({
      license_no: Joi.string().required(),
    })
    .unknown(true),
  create: Joi.object()
    .keys({
      mototId: JoiObjectId().required(),
      action: Joi.string().required(),
      message: Joi.string().required(),
      price: Joi.number().required().min(0),
    })
    .unknown(true),
  put: Joi.object()
    .keys({
      action: Joi.string().required(),
      message: Joi.string().required(),
      price: Joi.number().required().min(0),
      server: JoiObjectId().required(),
    })
    .unknown(true),
};
