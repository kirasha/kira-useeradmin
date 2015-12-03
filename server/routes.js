'use strict';

var fs              = require('fs'),
    restQueryParser = require('rest-query-parser'),
    middleware    = require('./lib/middleware'),
    config          = require('./config/environment');

module.exports = function (app) {

  app.use(middleware.extendResponse);

  // respond with JSON to all /api request
  app.all('/api/*', function (req, res, next) {
    req.needJSON = true;
    next();
  });

  app.use('/api/*', restQueryParser());

  // automatically load api modules
  var modules = fs.readdirSync(config.root + '/server/api/');
  modules.forEach(function (module) {
    require('./api/' + module)(app);
  });

  // all other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.render('index', {
        title: 'Geek Solution User Manager'
      });
    });
};
