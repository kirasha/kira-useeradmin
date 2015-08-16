'use strict';

/**
 * Express config
 */

var exphbs          = require('express-handlebars'),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    cookieParser    = require('cookie-parser'),
    errorHandler    = require('errorhandler'),
    morgan          = require('morgan'),
    config          = require('./environment');

module.exports = function (app) {
  var env = app.get('env');

  // Use handlebars templating system
  app.engine('handlebars', exphbs({
    layoutsDir: config.root + '/server/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [config.root + '/server/views/partials/']
  }));
  app.set('views', config.root + '/server/views');
  app.set('view engine', 'handlebars');

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(methodOverride());

  if (env === 'development' || env === 'test') {
    app.use(morgan('dev'));
    app.use(errorHandler());
  }

};
