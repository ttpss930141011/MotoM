const { ApiKeyModel } = require('../model/ApiKey');

module.exports = class ApiRepo {
  static async findByKey(key) {
    return ApiKeyModel.findOne({ key: key, status: true }).lean().exec();
  }
};
