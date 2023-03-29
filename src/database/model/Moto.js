const { Schema, model } = require('mongoose');
const { OWNER_TYPE } = require('../../config');
const DOCUMENT_NAME = 'Moto';
const COLLECTION_NAME = 'motos';


const schema = new Schema(
  {
    license_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    owner_name: {
      type: String,
      required: true,
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
      // required: true,
      select: false,
    },
    owner_type: {
      type: String,
      enum: [OWNER_TYPE.NEW, OWNER_TYPE.BRONZE, OWNER_TYPE.SILVER, OWNER_TYPE.GOLD],
      default: OWNER_TYPE.NEW,
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
