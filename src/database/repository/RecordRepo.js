const RecordModel = require('../model/Record');
module.exports = class RecordRepo {
  static findByDate(startDate, endDate) {
    return RecordModel.find({ createdAt: { $gte: startDate, $lte: endDate } })
      .populate({
        path: 'moto_id',
        select: ['license_no', 'owner_name'],
      })
      .lean()
      .exec();
  }

  static async create(record, session = null) {
    return RecordModel.create([record], { session });
  }
  static async update(record, session = null) {
    return RecordModel.findOneAndUpdate({ _id: record._id }, record, { session }).lean().exec();
  }
  static async delete(id, session = null) {
    return RecordModel.findOneAndDelete({ _id: id }, { session }).lean().exec();
  }

  static async countMotoRecordsInDateRange(motoId, startDate, endDate, session = null) {
    return RecordModel.countDocuments(
      {
        moto_id: motoId,
        date: { $gte: startDate, $lte: endDate },
      },
      { session },
    ).exec();
  }
};
