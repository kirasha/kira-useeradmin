'use strict';

var request     = require('supertest'),
    should      = require('should'),
    Permission  = require('./permission.model'),
    TestHelper  = require('../../lib/testHelper'),
    app         = require('../../app');

describe('Permissions API', function () {
  before(function (done) {
    TestHelper.clean(Permission, done);
  });

  after(function (done) {
    TestHelper.clean(Permission, done);
  });

  function createPermission (attrs) {
    attrs = attrs || {};
    var permission = {
      name: attrs.name || 'Admin.view.all',
      description: attrs.description || 'Description of this permission',
      builtIn: attrs.builtIn || true,
      active: attrs.active || true
    };

    return permission;
  }

  it('GET /permissions should respond with JSON with correct status', function (done) {
    request(app)
      .get('/api/permissions')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(0);
        done(err);
      });
  });

  it('should create a permission on POST /api/permissions', function (done) {

    var permission = createPermission();
    request(app)
      .post('/api/permissions')
      .send(permission)
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Object);
        done(err);
      });
  });

});

