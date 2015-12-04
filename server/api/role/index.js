'use strict';

var controller = require('./role.controller');

module.exports = function (app) {
  // match /api/roles or /roles
  app.route('(/api)?/roles')
      .get(controller.index)
      .post(controller.create);

  app.route('(/api)?/roles/:id')
  .get(controller.show)
  .put(controller.update);

};
