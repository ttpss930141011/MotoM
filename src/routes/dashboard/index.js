const express = require('express');
const authentication = require('../../auth/authentication');
const apikey = require('../../auth/apikey');
const permission = require('../../helpers/permission');
const { Permission } = require('../../database/model/ApiKey');
const router = express.Router();

/* GET home page. */
router.get('/', authentication, function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use(apikey);
/*-------------------------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
module.exports = router;
