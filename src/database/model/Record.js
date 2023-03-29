const { Schema, model } = require('mongoose');
const { SERVICE_TYPE } = require('../../config');

const DOCUMENT_NAME = 'Record';
const COLLECTION_NAME = 'records';

const schema = new Schema(
  {
    moto_id: {
      type: Schema.Types.ObjectId,
      ref: 'Moto',
      required: true,
      select: false,
    },
    action: {
      type: Schema.Types.String,
      required: true,
      enum: [
        SERVICE_TYPE.CREATED,
        SERVICE_TYPE.UPDATED,
        SERVICE_TYPE.REPAIR,
        SERVICE_TYPE.MAINTAIN,
        SERVICE_TYPE.SALES,
        SERVICE_TYPE.RENTAL,
        SERVICE_TYPE.PARTS,
        SERVICE_TYPE.ACCESSORIES,
        SERVICE_TYPE.INSURANCE,
        SERVICE_TYPE.CLAIMS,
        SERVICE_TYPE.ACCIDENT,
        SERVICE_TYPE.INSPECTION,
        SERVICE_TYPE.OTHER,
      ],
    },
    price: {
      type: Schema.Types.Number,
      // required: true,
      default: 0,
      min: 0,
      max: 1000000000,
    },
    message: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 1000,
    },
    served_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
).index({ motoId: 1, createdAt: -1 });

const RecordModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = RecordModel;
