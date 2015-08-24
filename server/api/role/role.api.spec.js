'use strict';

var should      = require('should'),
    request     = require('supertest'),
    Role        = require('./role.model'),
    TestHelper  = require('../../lib/testHelper'),
    app         = require('../../app');

describe('Roles API', function () {
  before(function (done) {
    TestHelper.clean(Role, done);
  });

  after(function (done) {
    // server.close(done);
    TestHelper.clean(Role, done);
  });

  function createRole (attrs) {
    attrs = attrs || {};
    var role = {
      name: attrs.name || 'root',
      description: attrs.description || 'Description of this role',
      builtIn: attrs.builtIn || true,
      active: attrs.active || true
    };

    return role;
  }

  it('should respond with JSON with correct status on GET /api/roles', function (done) {
    request(app)
      .get('/api/roles')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(0);
        done(err);
      });
  });

  it('should create a role on POST /api/roles', function (done) {

    var role = createRole();
    request(app)
      .post('/api/roles')
      .send(role)
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Object);
        done(err);
      });
  });

});
