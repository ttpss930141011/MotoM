const { RoleModel } = require('../model/Role');

module.exports = class RoleRepo {
  static findByCode(code) {
    return RoleModel.findOne({ code: code, status: true }).lean().exec();
  }
};
