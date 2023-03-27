// Mapper for environment variables
const environment = process.env.NODE_ENV;
const port = process.env.PORT;
const secret = process.env.SECRET;
const db = {
  name: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  port: process.env.DB_PORT || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
};
const dbURI = `mongodb+srv://${db.user}:${encodeURIComponent(db.password)}@${db.host}/${db.name}`;
const corsUrl = process.env.CORS_URL;
const logDirectory = process.env.LOG_DIR;

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

const MOTOSERVICE_TYPE = {
  REPAIR: '機車維修', // 維修
  MAINTAIN: '機車保養', // 保養
  SALES: '機車銷售', // 銷售
  RENTAL: '機車租賃', // 租賃
  PARTS: '零件販售', // 零件
  ACCESSORIES: '配件販售', // 配件
  INSURANCE: '保險相關', // 保險
  CLAIMS: '理賠處理', // 理賠
  ACCIDENT: '事故處理', // 事故
  INSPECTION: '機車檢驗', // 檢驗
  OTHER: '其他業務', // 其他
};

module.exports = {
  environment,
  port,
  secret,
  db,
  dbURI,
  corsUrl,
  logDirectory,
  SERVICE_TYPE,
  MOTOSERVICE_TYPE
};
