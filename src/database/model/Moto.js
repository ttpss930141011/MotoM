const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Moto';
const COLLECTION_NAME = 'motos';

const schema = new Schema(
  {
    license_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    owner_name: {
      type: String,
    },
    owner_phone: {
      type: String,
    },
    records: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Record',
        },
      ],
      required: true,
      select: false,
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
).index({ license_no: 1, updated: -1 });

const MotoModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = MotoModel;
