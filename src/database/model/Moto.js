const { Schema, model } = require('mongoose');
const { SERVICE_TYPE } = require('../../config');
// const MotoRepo = require('../repository/MotoRepo');
const DOCUMENT_NAME = 'Moto';
const COLLECTION_NAME = 'motos';

const OWNER_TYPE = {
  NEW: 'new',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
};

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

schema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;
  const moto = await this.model.findById(doc._id).populate({
    path: 'records',
    match: { status: true },
  });

  const { records } = moto;
  if (!records) return;
  const totalAmount = records.reduce((sum, record) => {
    if (![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(record.action)) {
      return sum + record.price;
    }
    return sum;
  }, 0);
  const motoServiceCount = records.filter(
    (r) => ![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(r.action),
  ).length;

  let ownerType = OWNER_TYPE.NEW;
  if (records.length > 1 && ![SERVICE_TYPE.CREATED, SERVICE_TYPE.UPDATED].includes(records[1].action)) {
    ownerType = OWNER_TYPE.BRONZE;
  }

  if (totalAmount > 50000 || motoServiceCount > 10) {
    ownerType = OWNER_TYPE.SILVER;
  }

  if (totalAmount > 100000 || motoServiceCount > 30) {
    ownerType = OWNER_TYPE.GOLD;
  }
  await moto.updateOne({ owner_type: ownerType });
});

const MotoModel = model(DOCUMENT_NAME, schema, COLLECTION_NAME);

module.exports = MotoModel;
