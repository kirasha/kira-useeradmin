'use strict';

var Permission = require('./permission.model.js');

/*
 */

exports.index = function (req, res) {
  Permission.find({}, function (err, permissions) {
    if (err) {
      res.respond(err, '500');
    } else {
      res.respond(permissions, 'index');
    }
  });
};

/*
 * Create a new Permission
 */

exports.create = function (req, res) {
  var permission = new Permission(req.body);

  permission.save(function (err, permission) {
    if (err) {
      res.respond(err, '500');
    } else {
      res.respond(permission, 'permission');
    }
  });
};
