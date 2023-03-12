const Joi = require('joi');
const { BadRequestError } = require('../core/ApiError');
const { Types } = require('mongoose');
const Logger = require('../core/Logger');

const ValidationSource = {
  BODY: 'body',
  HEADER: 'headers',
  QUERY: 'query',
  PARAM: 'params',
};

const JoiObjectId = () =>
  Joi.string().custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }, 'Object Id Validation');

const validator =
  (schema, source = ValidationSource.BODY) =>
  (req, res, next) => {
    try {
      const { error } = schema.validate(req[source]);

      if (!error) return next();

      const { details } = error;
      const message = details.map((i) => i.message.replace(/['"]+/g, '')).join(',');
      Logger.error(message);

      next(new BadRequestError(message));
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  ValidationSource,
  JoiObjectId,
  validator,
};
