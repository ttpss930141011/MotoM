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

module.exports = {
  environment,
  port,
  secret,
  db,
  dbURI,
  corsUrl,
  logDirectory,
};
