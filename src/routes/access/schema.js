const Joi = require('joi');

module.exports = {
  login: Joi.object()
    .keys({
      username: Joi.string().required().min(3).max(24),
      password: Joi.string().required().min(6).max(24),
    })
    .unknown(true),
  register: Joi.object()
    .keys({
      username: Joi.string().required().min(3).max(24),
      password: Joi.string().required().min(6).max(24),
    })
    .unknown(true),
};
