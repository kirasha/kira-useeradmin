'use strict';

var Permission = require('../api/permission/permission.model');

var permissions = require('./permissions.json');

console.log('Starting populating...');

Permission.remove({}).then(function () {
  permissions.forEach(function (permissionObj) {
    var permission = new Permission(permissionObj);
    permission.save(function (err, saved) {
      console.log(saved);
    });
  });
});

