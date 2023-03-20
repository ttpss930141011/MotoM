const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Record';
const COLLECTION_NAME = 'records';
const ServiceType = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  REPAIR: 'REPAIR', // 維修
  MAINTAIN: 'MAINTAIN', // 保養
  SALES: 'SALES', // 銷售
  RENTAL: 'RENTAL', // 租賃
  PARTS: 'PARTS', // 零件
  ACCESSORIES: 'ACCESSORIES', // 配件
  INSURANCE: 'INSURANCE', // 保險
  CLAIMS: 'CLAIMS', // 理賠
  ACCIDENT: 'ACCIDENT', // 事故
  OTHER: 'OTHER', // 其他
};
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
        ServiceType.CREATED,
        ServiceType.UPDATED,
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
