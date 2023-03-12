const express = require('express');
const authentication = require('../auth/authentication');
const router = express.Router();
const login = require('./access/login');
const logout = require('./access/logout');
const dashboard = require('./dashboard/index');
const user = require('./profile/user');

// 根路由，確認是否有登入
router.get('/', authentication, (req, res) => res.redirect('/dashboard'));
router.use('/login', login);
router.use('/logout', logout);
router.use('/dashboard', dashboard);
router.use('/profile', user);

module.exports = router;