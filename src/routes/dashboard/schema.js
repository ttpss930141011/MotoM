const Joi = require('joi');

module.exports = {
  worktime: Joi.object()
    .keys({
      date: Joi.date().required(),
      start_work_time: Joi.date().required(),
      end_work_time: Joi.date().required(),
    })
    .unknown(true),
};
