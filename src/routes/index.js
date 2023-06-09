const express = require('express');
const authentication = require('../auth/authentication');
const router = express.Router();
const login = require('./access/login');
const register = require('./access/register');
const logout = require('./access/logout');
const dashboard = require('./dashboard');
const revenue = require('./revenue');
const moto = require('./moto');
const record = require('./record');
const search = require('./search');
const user = require('./profile/user');

// 根路由，確認是否有登入
router.get('/', authentication, (req, res) => res.redirect('/dashboard'));
router.use('/login', login);
router.use('/register', register);

router.use(authentication);

router.use('/logout', logout);
router.use('/search', search);
router.use('/moto', moto);
router.use('/record', record);
router.use('/dashboard', dashboard);
router.use('/revenue', revenue);
router.use('/profile', user);
module.exports = router;
