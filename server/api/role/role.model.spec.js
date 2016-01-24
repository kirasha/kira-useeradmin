'use strict';

var should      = require('should'),
    mongoose    = require('mongoose'),
    TestHelper  = require('../../lib/testHelper'),
    config      = require('../../config/environment'),
    Permission  = require('../permission/permission.model'),
    Role        = require('./role.model');

var role;

function createRole (name, description) {
  var role = new Role({
    name: name || 'tester',
    description: description || 'Description of this role',
    builtIn: true,
    active: true
  });

  return role;
}

describe('Role Model', function () {

  before(function (done) {
    TestHelper.prepare([Role, Permission], done);
  });

  after(function (done) {
    TestHelper.end(done);
  });

  beforeEach(function (done) {
    role = createRole();
    done();
  });

  afterEach(function (done) {
    TestHelper.clean([Role, Permission], done);
  });

  describe('create role', function () {
    it('should begin with no roles', function (done) {
      Role.find({}, function (err, roles) {
        should.not.exist(err);
        roles.should.have.length(0);
        done();
      });
    });

    it('should be able to create a role', function (done) {
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.name.should.equal(role.name);
        res.builtIn.should.equal(true);
        done();
      });
    });

    it('should not save a duplicate key name', function (done) {
      var duplicateRole = createRole(null, 'Duplicate role');

      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        duplicateRole.save(function (err2, res2) {
          should.exist(err2);
          should.not.exist(res2);
          done();
        });
      });
    });

    it('should not create a permission without a name', function (done) {
      role.name = '';
      role.save(function (err, res) {
        should.exist(err);
        should.not.exist(res);
        done();
      });
    });

  });

  describe('Default role', function () {

    function countDefaultRole (roles) {
      var defaultCount = 0;
      roles.forEach(function (role) {
        if (role.default) {
          defaultCount++;
        }
      });
      return defaultCount;
    }

    it('it should set a default role', function (done) {
      role.save(function (err, savedRole) {
        should.not.exist(err);
        should.exist(savedRole);
        Role.setDefaultRole(savedRole.name, function (err, updatedRole) {
          should.not.exist(err);
          should.exist(updatedRole);
          updatedRole.default.should.equal(true);
          done();
        });
      });
    });

    it('role should have only one default role', function (done) {
      var testRole = createRole('User', 'Regular user');

      role.save(function (err, role1) {
        should.not.exist(err);
        should.exist(role1);
        role1.should.have.property('default');
        role1.default.should.equal(false);
        Role.setDefaultRole(role1.name, function (err, role2) {
          should.not.exist(err);
          should.exist(role2);
          role2.default.should.equal(true);
          testRole.save(function (err, role3) {
            should.not.exist(err);
            should.exist(role3);
            role3.default.should.equal(false);
            Role.setDefaultRole(role3.name, function (err, role4) {
              should.not.exist(err);
              should.exist(role4);
              role4.default.should.equal(true);

              Role.find({}, function (err, roles) {
                should.not.exist(err);
                should.exist(roles);
                roles.should.have.length(2);
                countDefaultRole(roles).should.equal(1);
                done();
              });
            });
          });
        });
      });
    });

    it('should return the default role', function (done) {
      role.save(function (err, savedRole) {
        should.not.exist(err);
        should.exist(savedRole);
        Role.setDefaultRole(savedRole.name, function (err, updatedRole) {
          should.not.exist(err);
          should.exist(updatedRole);
          updatedRole.default.should.equal(true);
          Role.getDefaultRole(function (err, defaultRole) {
            should.not.exist(err);
            should.exist(defaultRole);
            defaultRole.default.should.equal(true);
            done();
          });
        });
      });
    });
  });

  describe('Assign Permission to role', function () {

    it('should be able to assign a permission to a role', function (done) {
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermission('Admin.Role.Test', function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          newRole.should.have.property('permissions');
          newRole.permissions.should.be.instanceof(Array);
          newRole.permissions.should.have.length(1);
          done();
        });
      });
    });

    it('should create the permission if it does not exist', function (done) {
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermission('Admin.Role.Test', function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          Permission.find({}, function (err, permissions) {
            should.not.exist(err);
            should.exist(permissions);
            permissions.should.have.length(1);
            done();
          });
        });
      });
    });

    it('should not create permission if the permission already exists', function (done) {
      var permission = new Permission({
          name: 'Admin.Role.Test',
          description: 'Test Permission',
          active: true,
          builtIn: true
        });

      permission.save(function (err, perm) {
        should.not.exist(err);
        should.exist(perm);
        role.save(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.assignPermission('Admin.Role.Test', function (err2, newRole) {
            should.not.exist(err2);
            should.exist(newRole);
            Permission.find({}, function (err, permissions) {
              should.not.exist(err);
              should.exist(permissions);
              permissions.should.have.length(1);
              done();
            });
          });
        });
      });
    });

    it('should be able to give multiple permissions at the same time', function (done) {
      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test'];
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermissions(permissionsArr, function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          newRole.permissions.should.have.length(permissionsArr.length);
          done();
        });
      });
    });

    it('should give all permission to root role by default', function (done) {

      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test'];
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermissions(permissionsArr, function (err2, newRole) {
          should.not.exist(err2);
          Role.findOne({ name: 'root' }, function (err, root) {
            should.not.exist(err);
            root.should.have.property('permissions');
            root.permissions.should.have.length(permissionsArr.length);
            root.permissions[0].toString().should.equal(newRole.permissions[0].toString());
            done();
          });
        });
      });
    });

    it('should not reassign permission if the role already have it', function (done) {

      var rootRole = createRole('root', 'Root role with all permissions');
      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test','Admin.Role.Test' ];

      rootRole.save(function (err, root) {
        should.not.exist(err);
        should.exist(root);
        root.assignPermission('Admin.Role.Test', function (err, res) {
          should.not.exist(err);
          should.exist(res);
          res.permissions.should.have.length(1);
          role.save(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.assignPermissions(permissionsArr, function (err2, newRole) {
              should.not.exist(err2);
              newRole.permissions.should.have.length(permissionsArr.length - 1);
              Role.findOne({ name: 'root' }, function (err, root) {
                should.not.exist(err);
                root.should.have.property('permissions');
                root.permissions.should.have.length(permissionsArr.length - 1);
                done();
              });
            });
          });
        });
      });
    });

  });

  describe('Revoke permission to role', function () {
    it('should be able to revoke permssion to a role', function (done) {
      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test'];
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermissions(permissionsArr, function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          newRole.revokePermission('Default.Role.Test', function (err, role) {
            should.not.exist(err);
            should.exist(role);
            role.permissions.should.have.length(permissionsArr.length - 1);
            role.permissions.indexOf('Default.Role.Test').should.equal(-1);
            done();
          });
        });
      });
    });

    it('should be able to revoke multiple permssions to a role', function (done) {
      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test'];
      var toBeRevoked = ['Manager.Role.Test', 'Default.Role.Test'];

      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermissions(permissionsArr, function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          newRole.revokePermissions(toBeRevoked, function (err, role) {
            should.not.exist(err);
            should.exist(role);
            role.permissions.should.have.length(1);
            role.permissions.indexOf('Default.Role.Test').should.equal(-1);
            role.permissions.indexOf('Manager.Role.Test').should.equal(-1);
            done();
          });
        });
      });
    });

    it('should not revoke a permission that a role does not have', function (done) {
      var permissionsArr = ['Admin.Role.Test', 'Manager.Role.Test', 'Default.Role.Test'];
      var toBeRevoked = ['Test.Role.Test', 'Manager.Role.Test'];

      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.assignPermissions(permissionsArr, function (err2, newRole) {
          should.not.exist(err2);
          should.exist(newRole);
          newRole.revokePermissions(toBeRevoked, function (err, role, warnings) {
            should.not.exist(err);
            warnings.should.have.length(1);
            should.exist(role);
            role.permissions.should.have.length(2);
            role.permissions.indexOf('Manager.Role.Test').should.equal(-1);
            done();
          });
        });
      });
    });

  });

});
