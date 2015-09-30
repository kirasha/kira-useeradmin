'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    findOrCreate    = require('mongoose-findorcreate'),
    async           = require('async'),
    Schema          = mongoose.Schema;

var Permission = require('../permission/permission.model');

var RoleSchema  = new Schema({
  name: {
    type: String,
    unique: true,
    required: 'Role name is required'
  },
  description: String,
  builtIn: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  default: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: Schema.Types.ObjectId, ref: 'Permission'
  }]
});

RoleSchema.plugin(uniqueValiator);
RoleSchema.plugin(findOrCreate);

RoleSchema.methods.assignPermissions = function (permissions, callback) {
  var role, schema = this;

  async.eachSeries(permissions, function iterator (permission, cb) {
    schema.assignPermission(permission, function (err, newRole) {
      role = newRole;
      cb(err);
    });
  }, function (err) {
    callback(err, role);
  });
};

RoleSchema.methods.assignPermission = function (permission, callback) {
  var schema = this;
  Permission.findOrCreate({ name: permission }, function (err, res) {
    if (!err && schema.permissions.indexOf(res._id) === -1) {
      schema.permissions.push(res._id);
      schema.save(function (err) {
        // update root role as well
        if (err) {
          callback(err, schema);
          return;
        }
        var rootRole = {
          name: 'root',
          description: 'Root role with all permissions',
          builtIn: true,
          active: true
        };
        schema.constructor.findOrCreate({ name: rootRole.name }, rootRole, function (err, root) {
          if (!err && root) {
            if (root.permissions.indexOf(res._id) === -1) {
              root.permissions.push(res._id);
              root.save(function (err) {
                callback(err, schema);
              });
            } else {
              callback(err, schema);
            }
          } else {
            callback(err, schema);
          }
        });
      });
    } else {
      return callback(null, schema);
    }
  });
};

RoleSchema.methods.revokePermission = function (permissionName, callback) {
  var schema = this;

  if (schema.permissions.length) {
    Permission.findOne({ name: permissionName }, function (err, permission) {
      if (!err && permission) {
        var index = schema.permissions.indexOf(permission.id);

        if (index !== -1) {
          schema.permissions.splice(index, 1);
          schema.save(function (err, res) {
            return callback(err, res);
          });
        }
      } else {
        return callback(err , schema, new Error('Role ' + schema.name + ' does not have Permission ' + permissionName));
      }
    });
  } else {
    return callback(null, schema, new Error('Role ' + schema.name + ' does not have Permission ' + permissionName));
  }
};

RoleSchema.methods.revokePermissions = function (permissions, callback) {
  var role,
      warnings = [],
      schema = this;

  async.eachSeries(permissions, function iterator (permission, cb) {
    schema.revokePermission(permission, function (err, newRole, warning) {
      role = newRole;
      if (warning) {
        warnings.push(warning);
      }

      cb(err);
    });
  }, function (err) {
    callback(err, role, warnings);
  });
};

RoleSchema.statics.setDefaultRole = function (roleName, callback) {

  var model = this;

  model.update({}, { default: false }, function (err, count) {
    if (err || !count) {
      callback(err);
    }
    model.findOneAndUpdate({ name: roleName }, { default: true }, function (err, doc) {
      if (err) {
        callback(err, doc);
        return;
      }
      model.findOne({ name: roleName }, function (err, role) {
        callback(err, role);
      });
    });
  });
};

RoleSchema.statics.getDefaultRole = function (callback) {
  var model = this;

  model.findOne({ default: true }, function (err, doc) {
    callback(err, doc);
  });
};

module.exports = mongoose.model('Role', RoleSchema);
