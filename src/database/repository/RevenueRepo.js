const RevenueModel = require('../model/Revenue');

module.exports = class RevenueRepo {
  static async upsert(record) {
    const date = new Date(record.createdAt);
    date.setHours(0, 0, 0, 0);
    const revenue = await RevenueModel.findOneAndUpdate(
      { date },
      {
        $inc: {
          total_revenue: record.price,
          total_motos: 1,
          new_motos: record.action === 'CREATED' ? 1 : 0,
          [`type_revenue.${record.action}`]: record.price,
        },
        $setOnInsert: {
          date,
        },
      },
      { upsert: true, new: true },
    );
    return revenue.toObject();
  }
  static async update(record) {
    return RevenueModel.findOneAndUpdate({ _id: record._id }, record).lean().exec();
  }
  static async delete(id) {
    return RevenueModel.findOneAndDelete({ _id: id }).lean().exec();
  }

  static async pull(record, session = null) {
    const date = new Date(record.createdAt);
    date.setHours(0, 0, 0, 0);
    const revenue = await RevenueModel.findOneAndUpdate(
      { date },
      {
        $inc: {
          total_revenue: -record.price,
          total_motos: -1,
          new_motos: record.action === 'CREATED' ? -1 : 0,
          [`type_revenue.${record.action}`]: -record.price,
        },
      },
      { upsert: true, new: true, session },
    );
    return revenue.toObject();
  }
};
