const { Schema, model } = require('mongoose');
const Logger = require('../../core/Logger');
const { SERVICE_TYPE } = require('../../config');
const DOCUMENT_NAME = 'Revenue';
const COLLECTION_NAME = 'revenues';

const schema = new Schema(
  {
    date: {
      type: Schema.Types.Date,
      required: true,
      unique: true,
    },
    total_revenue: {
      type: Schema.Types.Number,
      required: true,
      default: 0,
      min: 0,
      max: 1000000000,
    },
    total_motos: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Moto',
        },
      ],
      required: true,
      default: [],
    },
    new_motos: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Moto',
        },
      ],
      required: true,
      default: [],
    },
    type_revenue: {
      REPAIR: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      },
      MAINTAIN: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 保養收入
      SALES: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 銷售收入
      RENTAL: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 租賃收入
      PARTS: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 零件收入
      ACCESSORIES: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 配件收入
      INSURANCE: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 保險收入
      CLAIMS: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 理賠收入
      ACCIDENT: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 事故收入
      INSPECTION: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 檢驗收入
      OTHER: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 1000000000,
      }, // 其他收入
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
).index({ date: 1, createdAt: -1 });

const RevenueModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = RevenueModel;
