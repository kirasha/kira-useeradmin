'use strict';

var controller = require('./permission.controller');

module.exports = function (app) {
  // match /api/permissions or /permissions
  app.route('(/api)?/permissions')
      .get(controller.index)
      .post(controller.create);
};
