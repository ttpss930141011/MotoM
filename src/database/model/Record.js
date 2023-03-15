const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Record';
const COLLECTION_NAME = 'Records';

const ServiceType = {
  REPAIR, // 維修
  MAINTAIN, // 保養
  SALES, // 銷售
  RENTAL, // 租賃
  PARTS, // 零件
  ACCESSORIES, // 配件
  INSURANCE, // 保險
  CLAIMS, // 理賠
  ACCIDENT, // 事故
  OTHER, // 其他
};
const schema = new Schema(
  {
    moto: {
      type: Schema.Types.ObjectId,
      ref: 'Moto',
      required: true,
      select: false,
    },
    service: {
      type: Schema.Types.String,
      required: true,
      enum: [
        ServiceType.ACCESSORIES,
        ServiceType.ACCIDENT,
        ServiceType.CLAIMS,
        ServiceType.INSURANCE,
        ServiceType.MAINTAIN,
        ServiceType.OTHER,
        ServiceType.PARTS,
        ServiceType.REPAIR,
        ServiceType.RENTAL,
        ServiceType.SALES,
      ],
    },
    price: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
      max: 1000000000,
    },
    message: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 1000,
    },
    servedBy: {
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
).index({ moto: 1, created: -1 });

const RecordModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = RecordModel;
