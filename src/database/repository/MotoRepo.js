const MotoModel = require('../model/Moto');

module.exports = class MotoRepo {
  static async findById(id) {
    return MotoModel.findById(id)
      .select('+records')
      .populate({
        path: 'records',
        match: { status: true },
      })
      .lean()
      .exec();
  }

  static async findAll() {
    return MotoModel.find({}).lean().exec();
  }

  static async findByLicenseNo(license_no) {
    return MotoModel.findOne({ license_no })
      .select('+records')
      .populate({
        path: 'records',
        match: { status: true },
        populate: { path: 'served_by', select: 'username' },
      })
      .lean()
      .exec();
  }

  static async create(moto, session = null) {
    return MotoModel.create([moto], { session });
  }

  static async update(moto, session = null) {
    return MotoModel.findOneAndUpdate({ _id: moto._id }, { $set: { ...moto } }, { new: true, session })
      .lean()
      .exec();
  }

  static async pushRecord(motoId, recordId, session = null) {
    return MotoModel.findOneAndUpdate({ _id: motoId }, { $push: { records: recordId } }, { new: true, session })
      .lean()
      .exec();
  }
};
