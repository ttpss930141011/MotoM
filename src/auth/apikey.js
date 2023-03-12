const express = require('express');
const ApiKeyRepo = require('../database/repository/ApiKeyRepo');
const { ForbiddenError } = require('../core/ApiError');
const Logger = require('../core/Logger');
const { Header } = require('../core/utils');
const schema = require('./schema');
const { validator } = require('../helpers/validator');
const asyncHandler = require('../helpers/asyncHandler');

const router = express.Router();

module.exports = router.use(
  validator(schema.apiKey, 'headers'),
  asyncHandler(async (req, res, next) => {
    const key = req.headers[Header.API_KEY]?.toString();
    if (!key) throw new ForbiddenError();

    const apiKey = await ApiKeyRepo.findByKey(key);
    if (!apiKey) throw new ForbiddenError();
    // Logger.info(apiKey);

    req.apiKey = apiKey;
    return next();
  }),
);
