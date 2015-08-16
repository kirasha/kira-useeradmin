'use strict';

var controller = require('./user.controller');
// var auth = require('../../auth/auth.service');

// router.get('/', auth.hasRole('admin'), controller.index);
// router.get('/', controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/me', auth.isAuthenticated(), controller.me);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
// router.get('/:id', auth.isAuthenticated(), controller.show);
// router.post('/', controller.create);

module.exports = function (app) {
  // match /api/users or /users
  app.route('(/api)?/users')
      .get(controller.index)
      .post(controller.create);
};

