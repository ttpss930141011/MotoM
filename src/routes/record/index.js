const express = require('express');
const router = express.Router();
const MotoRepo = require('../../database/repository/MotoRepo');
const RecordRepo = require('../../database/repository/RecordRepo');
const RevenueRepo = require('../../database/repository/RevenueRepo');
const schema = require('./schema');
const { SuccessResponse } = require('../../core/ApiResponse');
const { BadRequestError } = require('../../core/ApiError');
const asyncHandler = require('../../helpers/asyncHandler');
const { validator, ValidationSource } = require('../../helpers/validator');
const { RoleCode } = require('../../database/model/Role');
const role = require('../../helpers/role');
const authorization = require('../../auth/authorization');
const { startSession, Types } = require('mongoose');
const Logger = require('../../core/Logger');
const { SERVICE_TYPE } = require('../../config');
const dayjs = require('dayjs');

// 取得當天所有records
router.get(
  '/',
  validator(schema.date, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const records = await RecordRepo.findByDate(start, end);
    const recordsData = records
      .filter((record) => ![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(record.action))
      .map((record, index) => {
        const { moto_id, owner_name, action, price, createdAt } = record;
        return {
          id: index + 1,
          license_no: moto_id.license_no,
          owner_name: moto_id.owner_name,
          action,
          price,
          createdAt: dayjs(createdAt).locale('zh-tw').format('YYYY/MM/DD HH:mm:ss'),
        };
      });
    return new SuccessResponse('success', recordsData).send(res);
  }),
);

router.post(
  '/',
  validator(schema.create),
  asyncHandler(async (req, res) => {
    const { mototId, action, message, price } = req.body;
    const record = { moto_id: mototId, action, message, price: Number(price), served_by: req.user._id };
    const session = await startSession();
    session.startTransaction();
    try {
      const [createdRecord] = await RecordRepo.create(record, session);
      const updatedMoto = await MotoRepo.pushRecord(mototId, createdRecord._id, session);
      await RevenueRepo.upsert(createdRecord, session);
      await MotoRepo.updateOwnerType(mototId, session);
      await session.commitTransaction();
      return new SuccessResponse('success', updatedMoto).send(res);
    } catch (err) {
      await session.abortTransaction();
      Logger.error(err);
      throw new BadRequestError(err);
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
    const newRecord = {
      _id: Types.ObjectId(id),
      action,
      message,
      price: Number(price),
      served_by: Types.ObjectId(server),
    };
    const session = await startSession();
    session.startTransaction();
    try {
      const oldRecord = await RecordRepo.update(newRecord, session);
      await RevenueRepo.update(oldRecord, newRecord, session);
      await session.commitTransaction();
      return new SuccessResponse('success', newRecord).send(res);
    } catch (err) {
      await session.abortTransaction();
      Logger.error(err);
      throw new BadRequestError(err);
    } finally {
      session.endSession();
    }
  }),
);

// 刪除records頁面路由
router.delete(
  '/:id',
  validator(schema.id, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await startSession();
    session.startTransaction();
    try {
      const deletedRecord = await RecordRepo.delete(id, session);
      await RevenueRepo.deleteRecord(deletedRecord, session);
      await MotoRepo.pullRecord(deletedRecord.moto_id, deletedRecord._id, session);
      await MotoRepo.updateOwnerType(deletedRecord.moto_id, session);
      await session.commitTransaction();
      return new SuccessResponse('success', deletedRecord).send(res);
    } catch (err) {
      await session.abortTransaction();
      Logger.error('Failed to delete revenue:', err);
      throw new BadRequestError(err);
    } finally {
      session.endSession();
    }
  }),
);

module.exports = router;
