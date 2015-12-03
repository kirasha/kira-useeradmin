'use strict';

var Controller = require('./permission.controller');

module.exports = function (app) {
  // match /api/permissions or /permissions
  app.route('(/api)?/permissions')
      .get(Controller.index)
      .post(Controller.create);

  app.route('(/api)?/permissions/:id')
      .get(Controller.show)
      .put(Controller.update);

};
