'use strict';

var request     = require('supertest'),
    should      = require('should'),
    Permission  = require('./permission.model'),
    TestHelper  = require('../../lib/testHelper'),
    permissions = require('../../populate/permissions.json'),
    app         = require('../../app');

describe('Permissions API', function () {
  before(function (done) {
    TestHelper.clean(Permission, done);
  });

  afterEach(function (done) {
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

  function generatePermissions (nbPermissions) {
    nbPermissions = nbPermissions || 30;
    var perms = permissions.slice(0, nbPermissions);
    var promises = perms.map(function (permission) {
      return new Permission(permission).save();
    });

    return Promise.all(promises);
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

  it('GET /permissions should respond with correct data', function (done) {
    generatePermissions().then(function (savedPermissions) {
        request(app)
          .get('/api/permissions')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            savedPermissions.length.should.equal(res.body.length);
            done();
          });
      }
    ).catch(done);
  });

  it('should paginate results', function (done) {
    generatePermissions(15).then(function (savedPermissions) {
      request(app)
        .get('/api/permissions?page=2&size=10')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Array);
          res.body.length.should.equal(5);
          done();
        });
    })
    .catch(function (err) {
      console.log(err);
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

  it('should be able to update permissions on PUT /api/permissions', function (done) {
    done();
  });

});

