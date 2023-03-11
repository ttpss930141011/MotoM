const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const Logger = require('./core/Logger');
const routesV1 = require('./routes/v1');
const cors = require('cors');
const helmet = require('helmet');
const { corsUrl, environment, db } = require('./config');
const session = require('express-session');
const passport = require('passport')
const MongoStore = require('connect-mongo');
const { ApiError } = require('./core/ApiError');
require('./database')();
process.on('uncaughtException', (e) => {
  Logger.error(e);
});
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(helmet());
app.use(passport.initialize())
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${db.user}:${encodeURIComponent(db.password)}@${db.host}/${db.name}`,
    }),
  }),
);

app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1', routesV1);
// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    ApiError.handle(new InternalError(), res);
    if (err.type === ErrorType.INTERNAL)
      Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    Logger.error(err);
    if (environment === 'development') {
      return res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
});

module.exports = app;
