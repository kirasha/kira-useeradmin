'use strict';

var should    = require('should'),
    mongoose  = require('mongoose'),
    config    = require('../../config/environment'),
    Role      = require('./role.model.js');

var role;

function createRole (name, description) {
  var role = new Role({
    name: name || 'root',
    description: description || 'Description of this role',
    builtIn: true,
    active: true
  });

  return role;
}

describe('Role Model', function () {

  before(function (done) {
    mongoose.connect(config.mongo.uri, config.mongo.options);

    Role.remove().exec().then(function () {
      done();
    });
  });

  after(function (done) {
    mongoose.connection.close(done);
  });

  beforeEach(function (done) {
    role = createRole();
    done();
  });

  afterEach(function (done) {
    Role.remove().exec().then(function () {
      done();
    });
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
        res.name.should.equal('root');
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

  describe('Role Permissions', function () {

    it('should be able to add a permission to a role', function (done) {
      role.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.givePermission('Admin.Role.Test', function (err2, newRole) {
          should.not.exist(err2);
          newRole.should.exist.and.have.a.property('permissions');
          newRole.permissions.should.be.instanceof(Array);
          newRole.permissions.should.have.length(1);
        });
      });
    });

    it('should create permission if the permission does not exist', function (done) {

    });

    it('should be able to give multiple permssions at the same time', function (done) {

    });

    it('should give all permission to root user by default', function (done) {

    });

    it('should be able to revoke permssion to a role', function (done) {

    });

    it('should be able to revoke multiple permssions to a role', function (done) {

    });

    it('should not revoke a permission that a role does not have', function (done) {

    });

  });

});
