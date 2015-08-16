'use strict';

var fs = require('fs'),
    config = require('./config/environment');

module.exports = function (app) {

  app.use(function (req, res, next) {
    res.respond = function (data, file) {
      if (req.needJSON) {
        res.json(data);
      } else {
        res.render(file, data);
      }
    };
    next();
  });

  // respond with JSON to all /api request
  app.all('/api/*', function (req, res, next) {
    req.needJSON = true;
    next();
  });

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
