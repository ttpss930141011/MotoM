const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'ApiKey';
const COLLECTION_NAME = 'api_keys';

const Permission = {
  GENERAL: 'GENERAL',
};

const schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      maxlength: 1024,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    permissions: {
      type: [
        {
          type: String,
          required: true,
          enum: [Permission.GENERAL],
        },
      ],
      required: true,
    },
    comments: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
      ],
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const ApiKeyModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = { ApiKeyModel, Permission };
