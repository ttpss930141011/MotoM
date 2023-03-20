const MotoModel = require('../model/Moto');

module.exports = class MotoRepo {
  static async findAll() {
    return MotoModel.find({}).lean().exec();
  }

  static async findByLicenseNo(license_no) {
    return MotoModel.findOne({ license_no })
      .select('+records')
      .populate({
        path: 'records',
        match: { status: true },
      })
      .lean()
      .exec();
  }

  static async create(moto) {
    return MotoModel.create(moto);
  }
  static async update(moto) {
    return MotoModel.updateOne({ _id: moto._id }, { $set: { ...moto } })
      .lean()
      .exec();
  }
  static async updateRecord(motoId, recordId) {
    return MotoModel.updateOne({ _id: motoId }, { $push: { records: recordId } })
      .lean()
      .exec();
  }
};
