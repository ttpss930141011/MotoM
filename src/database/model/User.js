const { model, Schema } = require('mongoose');
const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const UserSchema = new Schema(
  {
    username: {
      type: Schema.Types.String,
      required: true,
    },
    displayname: {
      type: Schema.Types.String,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    lastestLogin: {
      type: Schema.Types.Date,
      default: Date.now(),
      required: true,
    },
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      required: true,
      select: false,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
const UsersModel = model(DOCUMENT_NAME, UserSchema, COLLECTION_NAME);
module.exports = UsersModel;
