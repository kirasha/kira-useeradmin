'use strict';

var Permission  = require('../api/permission/permission.model'),
    Role        = require('../api/role/role.model');

var permissions = require('./permissions.json'),
    roles       = require('./roles.json');

var promises = [],
    rolePromises = [];

function assignPermissions (roleModel, permissions) {
  return new Promise(function (resolve, reject) {
    return roleModel.assignPermissions(permissions, function (err, assignedRole) {
      if (err) {
        return reject(err);
      } else {
        return resolve(assignedRole);
      }
    });
  });
}

function saveRole (roleObj) {
  var rolePermissions = null;
  if (roleObj.permissions) {
    rolePermissions = roleObj.permissions;
    delete roleObj.permissions;
  }
  var role = new Role(roleObj);
  return role.save().then(function (savedRole) {
    if (rolePermissions) {
      return assignPermissions(savedRole, rolePermissions).then(function (rolePermissions) {
        return Promise.resolve(rolePermissions);
      });
    } else {
      return Promise.resolve(savedRole);
    }
  })
  .catch(function (err) {
    return Promise.reject(err);
  });
}

function populate (doneCb) {
  console.log('Starting populating...');
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
      Promise.all(rolePromises).then(function (promises) {
        doneCb();
      });
      console.log('Populating ' + rolePromises.length + ' roles');
    }).catch(function (err) {
      doneCb(err);
    });

  });
}

module.exports = populate;

