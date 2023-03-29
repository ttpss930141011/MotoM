const RevenueModel = require('../model/Revenue');

module.exports = class RevenueRepo {
  static async upsert(record, session = null) {
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
      { upsert: true, new: true, session },
    );
    return revenue.toObject();
  }
  static async update(record) {
    return RevenueModel.findOneAndUpdate({ _id: record._id }, record).lean().exec();
  }
  static async delete(id) {
    return RevenueModel.findOneAndDelete({ _id: id }).lean().exec();
  }

  // minus old record and add new record
  static async pull(oldRecord, newRecord, session = null) {
    const date = new Date(oldRecord.createdAt);
    date.setHours(0, 0, 0, 0);
    console.log(oldRecord, newRecord);
    const revenue = await RevenueModel.findOneAndUpdate(
      { date },
      {
        $inc: {
          total_revenue: -oldRecord.price + newRecord.price,
          total_motos: 0,
          new_motos: oldRecord.action === 'CREATED' ? -1 : 0,
          [`type_revenue.${oldRecord.action}`]: -oldRecord.price,
          [`type_revenue.${newRecord.action}`]: newRecord.price,
        },
      },
      { upsert: true, new: true, session },
    );
  }

  static async delete(record, session = null) {
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
