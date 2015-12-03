/**
 * Entry point : Main applicaton file
 */
'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express   = require('express'),
    http      = require('http'),
    mongoose  = require('mongoose'),
    config    = require('./config/environment'),
    app,
    server;

app = express();
server = http.createServer(app);

// connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
// use native promises
mongoose.Promise = global.Promise;

// load express configuration
require('./config/express')(app);
// load routes
require('./routes')(app);
// Populate DB with sample data
if (config.populateDB) {
  require('./populate');
}

function startServer () {
  var server = http.createServer(app);

  server.listen(config.port, function () {
    console.log('Express server listening on %d in %s mode', config.port, app.get('env'));
  });

  return server;
}

function stopServer () {
  mongoose.connection.close(function () {
    console.log('closing database connection...');
    process.exit(0);
  });
}

exports = module.exports = app;

app.startServer = startServer;
app.stopServer = stopServer;
