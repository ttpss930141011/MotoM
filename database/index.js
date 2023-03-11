const mongoose = require('mongoose');
const Logger = require('../core/Logger');
const { db } = require('../config');

module.exports = () => {
  // Build the connection string
  const dbURI = `mongodb+srv://${db.user}:${encodeURIComponent(db.password)}@${db.host}/${db.name}`;

  const options = {
    autoIndex: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    // connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  Logger.debug(dbURI);

  // Create the database connection
  console.log('Mongoose connection start');
  mongoose.set('strictQuery', false);
  mongoose
    .connect(dbURI, options)
    .then(() => {
      Logger.info('Mongoose connection done');
    })
    .catch((e) => {
      Logger.info('Mongoose connection error');
      Logger.error(e);
    });

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.once('connected', () => {
    Logger.info('Mongoose default connection open to ' + dbURI);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    Logger.error('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    Logger.info('Mongoose default connection disconnected');
  });

  // // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      Logger.info('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};
