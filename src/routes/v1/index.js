const express = require('express');
const apikey = require('../../auth/apikey');
const permission = require('../../helpers/permission');
const { Permission } = require('../../database/model/ApiKey');
const login = require('./access/login');
const logout = require('./access/logout');
const user = require('./profile/user');

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use(apikey);
/*-------------------------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
router.use('/login', login);
router.use('/logout', logout);
router.use('/profile', user);

module.exports = router;
