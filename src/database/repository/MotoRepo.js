const MotoModel = require('../model/Moto');

module.exports = class MotoRepo {
  static async findAll() {
    return MotoModel.find({}).lean().exec();
  }

  static async findByLicenseNo(license_no) {
    return MotoModel.find({ license_no }).lean().exec();
  }

  static async create(moto) {
    return MotoModel.create(moto).toObject();
  }
  static async update(customer) {
    return MotoModel.updateOne({ _id: customer._id }, { $set: { ...customer } })
      .lean()
      .exec();
  }
  static async updateRecord(customerId, recordId) {
    return MotoModel.updateOne({ _id: customerId }, { $push: { records: recordId } })
      .lean()
      .exec();
  }
};
