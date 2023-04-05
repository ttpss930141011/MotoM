const RevenueModel = require('../model/Revenue');
const { SERVICE_TYPE } = require('../../config');
const RecordRepo = require('./RecordRepo');

module.exports = class RevenueRepo {
  static async getRevenueByDate(date) {
    return RevenueModel.findOne({ date }).lean().exec();
  }

  static async getRevenueByMonth(month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return RevenueModel.find({ date: { $gte: start, $lt: end } })
      .lean()
      .exec();
  }

  static async getIsOpenByMonth(month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return RevenueModel.find({ date: { $gte: start, $lt: end } }, { is_open: 1, date: 1, _id: 0 })
      .lean()
      .exec();
  }

  static async create(revenue, session = null) {
    return RevenueModel.create(revenue, { session });
  }
  static async findOneByDateAndUpsert(revenue, session = null) {
    const update = { ...revenue }; // 将需要更新的属性展开到一个新的对象中
    delete update.date; // 删除不需要更新的属性
    return RevenueModel.findOneAndUpdate(
      { date: revenue.date },
      {
        $setOnInsert: { date: revenue.date },
        $set: update,
      },
      { upsert: true, new: true, session },
    )
      .lean()
      .exec();
  }

  // 將這筆紀錄加入到當日的收入中，total_motos、new_motos是array，所以要用$push推入record的moto_id，是否為新車則用action判斷，
  // type_revenue則是object，裡面分別記錄了每個action的營收
  // 如果total_motos、new_motos內的objectId已經存在，則不會重複push
  // 如果這日期存在，則需要 push total_motos、new_motos與增加type_revenue內、total_revenue的營收
  // 如果這日期不存在，則需要新增一筆資料，並且push total_motos、new_motos與增加type_revenue內、total_revenue的營收
  static async upsert(record, session = null) {
    const date = new Date(record.createdAt);
    date.setHours(0, 0, 0, 0);
    const { action, price, moto_id } = record;
    const update = {
      $addToSet: {
        total_motos: moto_id,
      },
      $inc: {
        [`type_revenue.${action}`]: price,
        total_revenue: price,
      },
    };
    if ([SERVICE_TYPE.CREATED].includes(action)) {
      update.$addToSet.new_motos = moto_id;
    }
    return RevenueModel.findOneAndUpdate({ date }, update, { upsert: true, new: true, session }).lean().exec();
  }
  // minus old record and add new record，如果這筆紀錄是新車，則new_motos要把這筆紀錄的moto_id從array中移除
  static async update(oldRecord, newRecord, session = null) {
    const date = new Date(oldRecord.createdAt);
    date.setHours(0, 0, 0, 0);
    const incObj = {
      total_revenue: -oldRecord.price + newRecord.price,
      [`type_revenue.${oldRecord.action}`]: -oldRecord.price,
    };
    if (oldRecord.action === newRecord.action) {
      incObj[`type_revenue.${newRecord.action}`] = newRecord.price - oldRecord.price;
    } else {
      incObj[`type_revenue.${newRecord.action}`] = newRecord.price;
    }
    //如果這筆紀錄是新車，但是更新後不是新車，則new_motos要把這筆紀錄的moto_id從array中移除
    const pullObj = {};
    if (oldRecord.action === SERVICE_TYPE.CREATED) {
      pullObj.new_motos = oldRecord.moto_id;
    }
    //如果這筆紀錄不是新車，但是更新後是新車，則new_motos要把這筆紀錄的moto_id加入到array中
    const addToSetObj = {};
    if (newRecord.action === SERVICE_TYPE.CREATED) {
      addToSetObj.new_motos = newRecord.moto_id;
    }
    return RevenueModel.findOneAndUpdate(
      { date },
      {
        $inc: incObj,
        $pull: pullObj,
        $addToSet: addToSetObj,
      },
      { new: true, session },
    )
      .lean()
      .exec();
  }
  // 刪除record，要把total_revenue、type_revenue內的營收減掉，並且把total_motos、new_motos內的moto_id移除
  // 使用Record countMotoRecordsInDateRange來判斷是否要移除total_motos、new_motos
  // 因為要確定這筆紀錄的moto_id在當天有沒有其他的紀錄，如果有的話，就不能移除
  static async deleteRecord(record, session = null) {
    const date = new Date(record.createdAt);
    date.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const { action, price, moto_id } = record;
    const incObj = {
      total_revenue: -price,
      [`type_revenue.${action}`]: -price,
    };
    const count = await RecordRepo.countMotoRecordsInDateRange(moto_id, date, endOfDay, session);
    const pullObj = {};
    if (count === 0) {
      pullObj.total_motos = moto_id;
      if (action === SERVICE_TYPE.CREATED) {
        pullObj.new_motos = moto_id;
      }
    }
    return RevenueModel.findOneAndUpdate(
      { date },
      {
        $inc: incObj,
        $pull: pullObj,
      },
      { new: true, session },
    );
  }

  static async workTimeUpsert(date, start_work_time, end_work_time, session = null) {
    return RevenueModel.findOneAndUpdate(
      { date },
      { $setOnInsert: { date, start_work_time, end_work_time } },
      { upsert: true, new: true },
    )
      .lean()
      .exec();
  }
};
