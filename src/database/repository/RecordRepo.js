const RecordModel = require('../model/Record');

module.exports = class RecordRepo {
  static async create(record, session = null) {
    return RecordModel.create([record], { session });
  }
  static async update(record, session = null) {
    return RecordModel.findOneAndUpdate({ _id: record._id }, record, { session }).lean().exec();
  }
  static async delete(id, session = null) {
    return RecordModel.findOneAndDelete({ _id: id }, { session }).lean().exec();
  }
};
