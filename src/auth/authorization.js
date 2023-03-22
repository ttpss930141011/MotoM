const express = require('express');
const { AuthFailureError } = require('../core/ApiError');
const RoleRepo = require('../database/repository/RoleRepo');
const asyncHandler = require('../helpers/asyncHandler');

const router = express.Router();

module.exports = router.use(
  asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.roles || !req.currentRoleCode) throw new AuthFailureError('Permission denied');

    const role = await RoleRepo.findByCode(req.currentRoleCode);
    if (!role) throw new AuthFailureError('Permission denied');

    const validRoles = req.user.roles.filter((userRole) => userRole._id.toString () === role._id.toString ());
    if (!validRoles || validRoles.length == 0) throw new AuthFailureError('Permission denied');

    return next();
  }),
);
