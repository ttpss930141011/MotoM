const express = require('express');
const path = require('path');
const { NotFoundError, InternalError } = require('./core/ApiError');
const morgan = require('morgan');
const Logger = require('./core/Logger');
const cors = require('cors');
const flash = require('connect-flash');
const helmet = require('helmet');
const { secret, corsUrl, environment, db } = require('./config');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { ApiError } = require('./core/ApiError');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const favicon = require('express-favicon');
const mongoose = require('./database')();
const routesV1 = require('./routes');
const UserRepo = require('./database/repository/UserRepo');
const { BadRequestError } = require('./core/ApiError');
const bcrypt = require('bcryptjs');
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
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon', 'favicon.ico')));
/*---------------------------------------------------------*/
// Use Session
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${db.user}:${encodeURIComponent(db.password)}@${db.host}/${db.name}`,
    }),
  }),
);
/*---------------------------------------------------------*/
// Use Flash
app.use(flash());
/*---------------------------------------------------------*/
// 初始化 Passport
app.use(passport.initialize());
app.use(passport.session());
// localStrategy
passport.use(
  'login',
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await UserRepo.findByUsername(username);
      if (!user) return done(new BadRequestError('User not found'), false);
      if (!bcrypt.compareSync(password, user.password)) return done(new BadRequestError('Incorrect password'), false);
      return done(null, user);
    } catch (err) {
      if (err) return done(err);
    }
  }),
);
passport.use(
  'register',
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const existingUser = await UserRepo.findByUsername(username);
        if (existingUser) return done(new BadRequestError('User already exists'), false);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserRepo.create(
          {
            username: username,
            displayname: username,
            password: hashedPassword,
          },
          'EDITOR',
        );
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
// googleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await UserRepo.findByUsername(profile.id);
        if (existingUser) return done(null, existingUser)
      
        const hashedPassword = await bcrypt.hash(profile.id, 10);
        const newUser = await UserRepo.create(
          {
            username: profile.id,
            displayname: profile.displayName,
            password: hashedPassword,
          },
          'EDITOR',
        );
        return done(null, newUser);
      } catch (err) {
        console.error(err);
        return done(err);
      }
    },
  ),
);

// 序列化和反序列化
passport.serializeUser((user, done) => {
  process.nextTick(function () {
    // console.log('serializeUser', user);
    return done(null, {
      _id: user._id,
      roles: user.roles,
      username: user.username,
      displayname: user.displayname,
    });
  });
});
passport.deserializeUser((user, done) => {
  process.nextTick(async () => {
    const storedUser = await UserRepo.findByIdNotPopulate(user._id);
    // console.log(storedUser);
    if (!storedUser) return done(null, false);
    return done(null, storedUser);
  });
});
/*-------------------------------------------------------------------------*/
// app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));
app.use(cors());
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
  console.log(err);
  Logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  Logger.error(err);
  if (err instanceof ApiError) return ApiError.handle(err, res);
  if (environment === 'development') return res.status(500).send(err);
  return ApiError.handle(new InternalError(req), res);
});

module.exports = app;
