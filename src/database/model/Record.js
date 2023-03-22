const { Schema, model } = require('mongoose');
const MotoRepo = require('../repository/MotoRepo');
const Logger = require('../../core/Logger');

const DOCUMENT_NAME = 'Record';
const COLLECTION_NAME = 'records';
const SERVICE_TYPE = {
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
  INSPECTION: 'INSPECTION', // 檢驗
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

schema.post('deleteOne', async function (doc) {
  const record = doc;
  const moto = await MotoRepo.findById(record.moto_id);
  if (!moto) {
    Logger.error('Cannot find corresponding moto');
    return;
  }
  moto.records.pull(record._id);
  await moto.save();
});
const RecordModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = { RecordModel, SERVICE_TYPE };
