'use strict';

var Role = require('./role.model.js');

/*
 * Find all roles
 */
exports.index = function (req, res) {
  Role.find({}, function (err, roles) {
    if (err) {
      res.respond(err, '500');
    } else {
      res.respond(roles, 'index');
    }

  });
};

/*
 * Creates a new role
 */
exports.create = function (req, res) {
  var role = new Role(req.body);

  role.save(function (err, role) {
    if (err) {
      res.respond(err, '500');
    } else {
      res.respond(role, 'role');
    }
  });
};
