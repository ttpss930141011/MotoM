const { config } = require('dotenv');
config({ path: `.env.${process.env.NODE_ENV}` });
const { port } = require('./config');
const Logger = require('./core/Logger');
const app = require('./app');
app
  .listen(port, () => Logger.info(`server running on port : ${port}`))
  .on('error', (e) => Logger.error(`server running on error : ${e}`));
