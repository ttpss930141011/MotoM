const express = require('express');
const router = express.Router();

// 客戶列表頁面路由
router.get('/', (req, res) => {
  res.render('customers', { title: 'Customers' });
});

// 單一客戶詳細資料頁面路由
// router.get('/customers/:id', customers.show);

// 新增客戶頁面路由
// router.get('/customers/new', customers.new);

module.exports = router;
