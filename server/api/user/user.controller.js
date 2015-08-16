'use strict';

var User = require('./user.model');

exports.index = function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      return res.respond(err, '500');
    }
    res.respond(users, 'index');
  });
};

/*
 * Create a new user
 */
exports.create = function (req, res) {
  var user = new User(req.body);

  user.save(function (err, user) {
    if (err) {
      res.respond(err, '404');
    } else {
      res.respond(user, 'user');
    }

  });
};
