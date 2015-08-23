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
    it('should begin with no permission', function (done) {
      Role.find({}, function (err, roles) {
        should.not.exist(err);
        roles.should.have.length(0);
        done();
      });
    });

    it('should be able to create a permission', function (done) {
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

});
