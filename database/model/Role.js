const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Role';
const COLLECTION_NAME = 'roles';

const RoleCode = {
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

const schema = new Schema(
  {
    code: {
      type: Schema.Types.String,
      required: true,
      enum: [RoleCode.EDITOR, RoleCode.ADMIN],
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

const RoleModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = {
  RoleModel,
  RoleCode,
};
