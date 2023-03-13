const UserModel = require('../model/User');
const { RoleModel } = require('../model/Role');
const { InternalError } = require('../../core/ApiError');

module.exports = class UserRepo {
  // contains critical information of the user
  static findById(id) {
    console.log(id);
    return UserModel.findOne({ _id: id, status: true })
      .select('+password +roles')
      .populate({
        path: 'roles',
        match: { status: true },
      })
      .lean()
      .exec();
  }

  static findByUsername(username) {
    return (
      UserModel.findOne({ username, status: true })
        .select('+roles')
        // .select('+email +password +roles')
        .populate({
          path: 'roles',
          match: { status: true },
          select: { code: 1 },
        })
        .lean()
        .exec()
    );
  }

  static findProfileById(id) {
    return UserModel.findOne({ _id: id, status: true })
      .select('+roles')
      .populate({
        path: 'roles',
        match: { status: true },
        select: { code: 1 },
      })
      .lean()
      .exec();
  }

  static findPublicProfileById(id) {
    return UserModel.findOne({ _id: id, status: true }).lean().exec();
  }

  static async create(user, roleCode) {
    const now = new Date();
    const role = await RoleModel.findOne({ code: roleCode })
      // .select('+email +password')
      .lean()
      .exec();
    if (!role) throw new InternalError('Role must be defined');
    user.roles = [role._id];
    const createdUser = await UserModel.create(user);
    return { user: createdUser.toObject() };
  }

  static async update(user) {
    return UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
      .lean()
      .exec();
  }
};
