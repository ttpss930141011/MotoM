const { ForbiddenError } = require('../core/ApiError');

module.exports = (permission) => (req, res, next) => {
  try {
    if (!req.apiKey?.permissions) return next(new ForbiddenError('Permission Denied'));
    const exists = req.apiKey.permissions.find((entry) => entry === permission);
    if (!exists) return next(new ForbiddenError('Permission Denied'));

    next();
  } catch (error) {
    next(error);
  }
};
