const express = require('express');
const router = express.Router();
const MotoRepo = require('../../database/repository/MotoRepo');
const RecordRepo = require('../../database/repository/RecordRepo');
const schema = require('./schema');
const { SuccessResponse } = require('../../core/ApiResponse');
const asyncHandler = require('../../helpers/asyncHandler');
const { validator, ValidationSource } = require('../../helpers/validator');
const { RoleCode } = require('../../database/model/Role');
const role = require('../../helpers/role');
const authorization = require('../../auth/authorization');
const { startSession } = require('mongoose');

router.post(
  '/',
  validator(schema.create),
  asyncHandler(async (req, res) => {
    const { mototId, action, message, price } = req.body;
    const record = { moto_id: mototId, action, message, price, served_by: req.user._id };
    const session = await startSession();
    session.startTransaction();
    try {
      const createdRecord = await RecordRepo.create(record);
      const updatedMoto = await MotoRepo.pushRecord(mototId, createdRecord._id);
      await session.commitTransaction();
      return new SuccessResponse('success', updatedMoto).send(res);
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  }),
);

/*-------------------------------------------------------------------------*/
// Below all APIs are private APIs protected for admin's role
router.use('/', role(RoleCode.ADMIN), authorization);
/*-------------------------------------------------------------------------*/

// 更新records頁面路由
router.put(
  '/:id',
  validator(schema.id, ValidationSource.PARAM),
  validator(schema.put),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, message, price, server } = req.body;
    const record = { _id: id, action, message, price, served_by: server };
    const updatedRecord = await RecordRepo.update(record);
    return new SuccessResponse('success', updatedRecord).send(res);
  }),
);

// 刪除records頁面路由
router.delete(
  '/:id',
  validator(schema.id, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedRecord = await RecordRepo.delete(id);
    return new SuccessResponse('success', deletedRecord).send(res);
  }),
);

module.exports = router;
