const { ApiKeyModel } = require('../model/ApiKey');

class ApiRepo {
  static async findByKey(key) {
    return ApiKeyModel.findOne({ key: key, status: true }).lean().exec();
  }
}

module.exports = ApiRepo;
