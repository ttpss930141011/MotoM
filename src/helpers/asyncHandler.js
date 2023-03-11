const asyncMiddleware = (execution) => (req, res, next) => {
  execution(req, res, next).catch(next);
};

module.exports = asyncMiddleware;
