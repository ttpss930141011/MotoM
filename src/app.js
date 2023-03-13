const express = require('express');
const path = require('path');
const { NotFoundError, InternalError } = require('./core/ApiError');
const morgan = require('morgan');
const Logger = require('./core/Logger');
const cors = require('cors');
const helmet = require('helmet');
const { corsUrl, environment, db } = require('./config');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { ApiError } = require('./core/ApiError');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const favicon = require('express-favicon');
const mongoose = require('./database')();
const routesV1 = require('./routes');
const UsersModel = require('./database/repository/UserRepo');
const { BadRequestError } = require('./core/ApiError');
// routes import

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app = express();
/*---------------------------------------------------------*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/*---------------------------------------------------------*/
// Use Helmet
app.use(helmet());
/*---------------------------------------------------------*/
// Use Favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
/*---------------------------------------------------------*/
// Use Session
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
/*-------------------------------------------------------------------------*/
// 初始化 Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await UsersModel.findByUsername(username);
      if (!user) return done(new BadRequestError('User not found'), false);
      if (user.password !== password) return done(new BadRequestError('Incorrect password'), false);
      return done(null, user);
    } catch (err) {
      if (err) return done(err);
    }
  }),
);
// 序列化和反序列化
passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  done(null, { username: username });
});
/*-------------------------------------------------------------------------*/
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
/*-------------------------------------------------------------------------*/
// Router import
app.use('/', routesV1);
/*---------------------------------------------------------*/
// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));
/*---------------------------------------------------------*/
// Middleware Error Handler
app.use((err, req, res, next) => {
  Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  Logger.error(err);
  if (err instanceof ApiError) return ApiError.handle(err, res);
  if (environment === 'development') return res.status(500).send(err);
  return ApiError.handle(new InternalError(), res);
});

module.exports = app;
