const { config } = require("dotenv");
config({ path: `.env.${process.env.NODE_ENV}` });
const { port } = require("./config");
const Logger = require("./core/Logger");
const app = require("./app");
app
  .listen(port, () => {
    console.info(`server running on port : ${port}`);
    Logger.info(`server running on port : ${port}`);
  })
  .on("error", (e) => {
    console.log(`server running on error : ${e}`);
    Logger.error(`server running on error : ${e}`);
  });
