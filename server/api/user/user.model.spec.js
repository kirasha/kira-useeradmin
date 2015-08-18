'use strict';

var should    = require('should'),
    mongoose  = require('mongoose'),
    config    = require('../../config/environment'),
    User      = require('./user.model');

var user;

describe('User Model', function () {
  before(function (done) {

    mongoose.connect(config.mongo.uri, config.mongo.options);
    // Clear users before testing
    User.remove().exec().then(function () {
      done();
    });
  });

  after(function (done) {
    mongoose.connection.close(done);
  });

  beforeEach(function (done) {
    user = new User({
      provider: 'local',
      firstName: 'Fake User',
      lastName: 'Test',
      username: 'test',
      email: 'tes@ttest.com',
      password: 'password123'
    });
    done();
  });

  afterEach(function (done) {
    User.remove().exec().then(function () {
      done();
    });
  });

  it('should begin with no users', function (done) {
    User.find({}, function (err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should save a user', function (done) {
    user.save(function (err, user) {
      should.not.exist(err);
      should.exist(user);
      done();
    });
  });

  it('it should have a virtual method fullName', function (done) {
    user.save(function (err, res) {
      res.fullName.should.equal(user.firstName + ' ' + user.lastName);
      done();
    });
  });

  it('should fail when saving a duplicate user', function (done) {
    user.save(function (err) {
      var userDup = new User(user);
      userDup.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function (done) {
    user.email = '';
    user.save(function (err) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving with a password less than 6 characters', function (done) {
    user.password = 'abc';
    user.save(function (err) {
      should.exist(err);
      done();
    });
  });

  it('should authenticate user if password is valid', function (done) {
    user.save(function (err, res) {
      should.not.exist(err);
      should.exist(res);
      res.authenticate('password123').should.be.true();
      done();
    });
  });

  it('should not authenticate user if password is invalid', function (done) {
    user.save(function (err, res) {
      should.not.exist(err);
      should.exist(res);
      res.authenticate('fake123').should.not.be.true();
      done();
    });
  });

  it('should find unique username', function (done) {
    user.save(function (err, res) {
      should.exist(res);
      User.findUniqueUsername(res.username, '', function (username) {
        should.exist(username);
        username.should.not.be.empty();
        username.should.not.equal(res.username);
        done();
      });

    });
  });
});
