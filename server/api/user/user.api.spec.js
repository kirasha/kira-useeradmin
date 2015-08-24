'use strict';

var request     = require('supertest'),
    should      = require('should'),
    User        = require('./user.model'),
    TestHelper  = require('../../lib/testHelper'),
    app         = require('../../app');

describe('User API /api/users', function () {

  before(function (done) {
    // start the server
    TestHelper.clean(User, done);
  });

  after(function (done) {
    // server.close(done);
    TestHelper.clean(User, done);
  });

  function createUser (attrs) {
    attrs = attrs || {};
    var user = {
      firstName: attrs.firstName || 'Fake User',
      lastName: attrs.lastName || 'Test',
      username: attrs.username || 'test',
      email: attrs.email || 'tes@ttest.com',
      password: attrs.password || 'password123',
      provider: attrs.provider || 'local'
    };

    return user;
  }

  it('Should respond with JSON with correct status', function (done) {
    request(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(0);
        done();
      });
  });

  it('should create a user', function (done) {

    var user = createUser();
    request(app)
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Object);
        done(err);
      });
  });

});
