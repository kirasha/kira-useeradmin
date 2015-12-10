'use strict';

var _               = require('lodash'),
    // sample express app
    config    = require('../../config/environment'),
    mongoose  = require('mongoose'),
    app         = require('express')(),

    // Models
    Role        = require('../../api/role/role.model'),
    Permission  = require('../../api/permission/permission.model'),

    // middlewares
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    restQueryParser = require('rest-query-parser'),
    middleware    = require('../middleware'),
    CRUDController = require('./CRUDController')(Role),

    // tests
    TestHelper  = require('../../lib/testHelper'),
    request     = require('supertest'),
    should      = require('should'),
    permissions = require('../../populate/permissions.json'),
    roles       = require('../../populate/roles.json'),
    populate    = require('../../populate');

// connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
// use native promises
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(middleware.extendResponse);

var apiRoute = '/api/test/crud';
var router = require('express').Router();

router.use(restQueryParser());

// CREATE
router.post('/', CRUDController.create());
// LIST
router.get('/', CRUDController.list());
// READ
router.get('/:id', CRUDController.read());
// UPDATE
router.put('/:id', CRUDController.update());
// DESTROY
router.delete('/:id', CRUDController.destroy());

app.use(apiRoute, router);

//  now run tests

describe('CRUD Controller', function () {
  before(function (done) {
    populate(done);
  });

  after(function (done) {
    TestHelper.clean(Role, function () {
      TestHelper.clean(Permission, done);
    });
    done();
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

  describe('GET', function () {
    var doc;
    it('should respond with JSON and with correct status', function (done) {
      request(app)
        .get(apiRoute)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Array);
          res.body.should.have.length(roles.length);
          doc = res.body[0];
          done(err);
        });
    });

    it('should always return default properties', function (done) {
      var defaultFields = ['id','name','createdAt', 'updatedAt','href'];
      request(app)
        .get(apiRoute)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          var role = res.body[0];
          role.should.have.properties(defaultFields);
          done(err);
        });
    });

    it('should paginate results and return correct headers', function (done) {
      request(app)
      .get(apiRoute + '?page=1&size=1')
        .expect(200)
        .expect('Content-type', /json/)
        .expect('Link', '</api/test/crud?page=2&size=1>; rel="next", </api/test/crud?page=3&size=1>; rel="last"')
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Array);
          res.body.length.should.equal(1);
          done();
        });
    });

    it('should return a document when given its id', function (done) {
      request(app)
        .get(apiRoute + '/' + doc.id)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(Object.keys(doc));
          res.body.id.should.equal(doc.id);
          done(err);
        });
    });
  });

  describe('POST', function () {
    it('POST should create a role and return it', function (done) {

      var role = createRole({ name: 'Role 1', builtIn: false });
      request(app)
        .post(apiRoute)
        .send(role)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(role);
          done(err);
        });
    });
  });

});
