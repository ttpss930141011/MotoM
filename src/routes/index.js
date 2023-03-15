const express = require('express');
const authentication = require('../auth/authentication');
const router = express.Router();
const login = require('./access/login');
const register = require('./access/register');
const logout = require('./access/logout');
const dashboard = require('./dashboard');
const moto = require('./moto');
const search = require('./search');
const user = require('./profile/user');

// 根路由，確認是否有登入
router.get('/', authentication, (req, res) => res.redirect('/dashboard'));
router.use('/login', login);
router.use('/register', register);
router.use('/logout', logout);

router.use('/search', search);
router.use('/moto', moto);
router.use('/dashboard', dashboard);
router.use('/profile', user);
module.exports = router;
