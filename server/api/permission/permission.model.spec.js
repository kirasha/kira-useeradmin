'use strict';

var should      = require('should'),
    mongoose    = require('mongoose'),
    config      = require('../../config/environment'),
    Permission  = require('./permission.model');

var permission;

function createPermission (name, description) {
  var permission = new Permission({
      name: name || 'User.View.List',
      description: description || 'Gives permission to view users list',
      active: true,
      builtIn: true
    });

  return permission;
}

describe('Permission Model', function () {

  before(function (done) {
    mongoose.connect(config.mongo.uri, config.mongo.options);
    // clear permissions before start testing
    Permission.remove().exec().then(function () {
      done();
    });
  });

  after(function (done) {
    mongoose.connection.close(done);
  });

  beforeEach(function (done) {
    permission = createPermission();
    done();
  });

  afterEach(function (done) {
    Permission.remove().exec().then(function () {
      done();
    });
  });

  describe('create Permission', function () {
    it('should begin with no permission', function (done) {
      Permission.find({}, function (err, permissions) {
        permissions.should.have.length(0);
      });
      done();
    });

    it('should be able to create a permission', function (done) {
      permission.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.name.should.equal('User.View.List');
        done();
      });
    });

    it('should not create permission with the same permission name', function (done) {
      var anotherPermission = createPermission('User.View.List', 'A Duplicate permission that should not be saved');
      permission.save(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        anotherPermission.save(function (err2, res2) {
          should.exist(err2);
          should.not.exist(res2);
          Permission.count(function (err, count) {
            should.not.exist(err);
            count.should.equal(1);
            done();
          });
        });
      });
    });

    it('should not create a permission without a name', function (done) {
      permission.name = '';
      permission.save(function (err, res) {
        should.exist(err);
        should.not.exist(res);
      });
      done();
    });

    it('should find or create a permission', function (done) {
      Permission.findOrCreate({ name: permission.name }, function (err, res, created) {
        should.not.exist(err);
        should.exist(res);
        created.should.equal(true);

        var duplPermission = new Permission(res);
        Permission.findOrCreate({ name: duplPermission.name }, function (err, res, created) {
          should.not.exist(err);
          should.exist(res);
          created.should.equal(false);

          Permission.find({}, function (err, permissions) {
            should.not.exist(err);
            permissions.should.have.length(1);

            var newPermission = createPermission('Test.Permission');
            var permissionObj = newPermission.toJSON();
            Permission.findOrCreate({ name: newPermission.name },
                                    permissionObj,
                                    function (err, permissionCreated, created) {
              should.not.exist(err);
              should.exist(permission);
              created.should.equal(true);
              permissionCreated.should.have.properties(permissionObj);
              Permission.count({}, function (err, counts) {
                should.not.exist(err);
                counts.should.equal(2);
                done(err);
              });
            });
          });
        });
      });
    });

    it('Should have filter function', function (done) {
      Permission.should.be.an.instanceOf(Object).and.have.property('filter');
      'function'.should.equal(typeof (Permission.filter));
      done();
    });
  });

});
