const express = require('express');
const router = express.Router();
const passport = require('passport');
const UsersModel = require('../../database/repository/UserRepo');
const { validator } = require('../../helpers/validator');
const schema = require('./schema');

router.get('/', function (req, res) {
  res.render('register', { title: 'Register', message: null });
});

// 設定/register路由
router.post('/', validator(schema.register), async (req, res) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password,
    };
    const user = await UsersModel.create(newUser, 'EDITOR');
    console.log('Register success', user);
    res.status(200).send({ message: 'Register success' });
});

module.exports = router;
