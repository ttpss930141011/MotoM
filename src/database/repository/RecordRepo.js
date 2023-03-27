const { RecordModel } = require('../model/Record');

module.exports = class RecordRepo {
  static async create(record) {
    return RecordModel.create(record);
  }
  static async update(record) {
    return RecordModel.updateOne({ _id: record._id }, { $set: { ...record } })
      .lean()
      .exec();
  }
  static async delete(id) {
    return RecordModel.findOneAndDelete({ _id: id }).lean().exec();
  }
};
