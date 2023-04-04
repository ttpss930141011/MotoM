const Joi = require('joi');

module.exports = {
  getdate: Joi.object()
    .keys({
      date: Joi.date().required(),
    })
    .unknown(true),
  getdateByMonth: Joi.object()
    .keys({
      year: Joi.number().required(),
      month: Joi.number().required(),
    })
    .unknown(true),

  worktime: Joi.object()
    .keys({
      date: Joi.date().required(),
      start_work_time: Joi.date().required(),
      end_work_time: Joi.date().required(),
    })
    .unknown(true),
};
