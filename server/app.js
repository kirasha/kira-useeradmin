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

// load express configuration
require('./config/express')(app);
// load routes
require('./routes')(app);

server.listen(config.port, function () {
  console.log('Express server listening on %d in %s mode', config.port, app.get('env'));
});

module.exports = {

  app: app,
  server: server

};
