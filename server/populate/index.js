'use strict';

var Permission  = require('../api/permission/permission.model'),
    Role        = require('../api/role/role.model');

var permissions = require('./permissions.json'),
    roles       = require('./roles.json');

console.log('Starting populating...');
var promises = [],
    rolePromises = [];

function saveRole (roleObj) {
  var rolePermissions = null;
  if (roleObj.permissions) {
    rolePermissions = roleObj.permissions;
    delete roleObj.permissions;
  }
  var role = new Role(roleObj);
  return role.save().then(function (savedRole) {
    if (rolePermissions) {
      return savedRole.assignPermissions(rolePermissions, function (err, assignedRole) {
        if (err) {
          return Promise.reject(err);
        } else {
          return Promise.resolve(assignedRole);
        }
      });
    } else {
      return Promise.resolve(savedRole);
    }
  }).catch(function (err) {
    return Promise.reject(err);
  });
}

Permission.remove({}).then(function () {
  promises = permissions.map(function (permissionObj) {
    var permission = new Permission(permissionObj);
    return permission.save();
  });

  Promise.all(promises);
  console.log('Population ' + promises.length + ' permissions');
  Role.remove({}).then(function () {
    rolePromises = roles.map(function (roleObj) {
      return saveRole(roleObj);
    });

    Promise.all(rolePromises);
    console.log('Populating ' + rolePromises.length + ' roles');
  });

});

