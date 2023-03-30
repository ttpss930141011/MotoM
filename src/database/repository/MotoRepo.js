const MotoModel = require('../model/Moto');
const { SERVICE_TYPE, OWNER_TYPE } = require('../../config');
const _ = require('lodash');

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

  static async findByIdWithLastRecords(id, session = null) {
    return MotoModel.findById(id, {}, { session })
      .select('+records')
      .select({ records: { $slice: -1 } })
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
  // automatically update owner type by records
  static async updateOwnerType(motoId, session = null) {
    const moto = await MotoModel.findById(motoId, {}, { session }).populate({
      path: 'records',
      match: { status: true },
    });
    const { records = [] } = moto;
    if (!records || _.isEmpty(records)) return;
    const totalAmount = records.reduce((sum, record) => {
      if (![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(record.action)) {
        return sum + record.price;
      }
      return sum;
    }, 0);
    const motoServiceCount = records.filter(
      (r) => ![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(r.action),
    ).length;

    let ownerType = OWNER_TYPE.NEW;
    if (records.length > 1 && ![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(records[1].action)) {
      ownerType = OWNER_TYPE.BRONZE;
    }

    if (totalAmount > 50000 || motoServiceCount > 10) {
      ownerType = OWNER_TYPE.SILVER;
    }

    if (totalAmount > 100000 || motoServiceCount > 30) {
      ownerType = OWNER_TYPE.GOLD;
    }
    // 將 ownerType 更新回 moto
    moto.owner_type = ownerType;
    await moto.save({ session });
  }

  static async pullRecord(motoId, recordId, session = null) {
    return MotoModel.findOneAndUpdate({ _id: motoId }, { $pull: { records: recordId } }, { new: true, session });
  }
};
