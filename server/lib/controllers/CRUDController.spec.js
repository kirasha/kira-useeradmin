'use strict';

var config    = require('../../config/environment'),
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
    // permissions = require('../../populate/permissions.json'),
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

  function getRandomDoc () {
    return new Promise(function (resolve, reject) {
      request(app)
        .get(apiRoute)
        .end(function (err, res) {
          if (err) {
            reject(err);
            return;
          }
          var index = Math.ceil(Math.random() * res.body.length) - 1;
          var doc = res.body[index];
          resolve(doc);
        });
    });
  }

  describe('GET', function () {
    var doc;

    describe('fields', function () {
      it('should respond with JSON and with correct status', function (done) {
        request(app)
          .get(apiRoute)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.should.have.length(roles.length);
            doc = res.body[2];
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

      it('should have id instead _id', function (done) {
        request(app)
          .get(apiRoute)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            var role = res.body[0];
            role.should.not.have.property('_id');
            role.should.have.property('id');
            done(err);
          });
      });

      it('should return requested fields', function (done) {
        var requestedFields = ['name','description', 'active'];
        request(app)
        .get(apiRoute + '?fields=name,description,active')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            var role = res.body[0];
            role.should.have.properties(requestedFields);
            done(err);
          });
      });

      it('should always have id and href properties', function (done) {
        request(app)
        .get(apiRoute + '?fields=name,description')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            var role = res.body[0];
            role.should.have.properties(['id','href']);
            done(err);
          });
      });

    });

    describe('Embeding documents', function () {
      it('should return requested embeded documents', function (done) {
        request(app)
        .get(apiRoute + '?embed=permissions')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            var role = res.body[0];
            role.should.have.property('permissions');
            done(err);
          });
      });

      it('should return default properties for embeded documents', function (done) {
        var defaultFields = ['id','name','createdAt', 'updatedAt','href'];
        request(app)
        .get(apiRoute + '?embed=permissions')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            var role = res.body[1];
            role.should.have.property('permissions');
            role.permissions[0].should.have.properties(defaultFields);
            role.permissions[0].should.not.have.property('_id');
            done(err);
          });
      });

      // TODO write tests for embeding multiple documents

    });

    describe('Pagination', function () {
      it('should return only next and last link headers', function (done) {
        request(app)
        .get(apiRoute + '?page=1&size=1')
          .expect(200)
          .expect('Content-type', /json/)
          .expect('Link', '</api/test/crud?page=2&size=1>; rel="next", </api/test/crud?page=5&size=1>; rel="last"')
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.length.should.equal(1);
            done();
          });
      });

      it('should return first, previous, next, last link headers', function (done) {
        request(app)
        .get(apiRoute + '?page=3&size=1')
          .expect(200)
          .expect('Content-type', /json/)
          .expect('Link', '</api/test/crud?page=1&size=1>; rel="first", </api/test/crud?page=2&size=1>; rel="previous", </api/test/crud?page=4&size=1>; rel="next", </api/test/crud?page=5&size=1>; rel="last"')
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.length.should.equal(1);
            done();
          });
      });

      it('should return first and previous headers', function (done) {
        request(app)
        .get(apiRoute + '?page=5&size=1')
          .expect(200)
          .expect('Content-type', /json/)
          .expect('Link', '</api/test/crud?page=1&size=1>; rel="first", </api/test/crud?page=4&size=1>; rel="previous"')
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.length.should.equal(1);
            done();
          });
      });

      it('should return sane defaults', function (done) {
        request(app)
        .get(apiRoute + '?size=2')
          .expect(200)
          .expect('Content-type', /json/)
          .expect('Link', '</api/test/crud?size=2&page=2>; rel="next", </api/test/crud?size=2&page=3>; rel="last"')
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.length.should.equal(2);
            done();
          });
      });

    });

    describe('Filtering', function () {
      it('should filter on == sign', function (done) {
        request(app)
        .get(apiRoute + '?filters=name==Administrator')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(1);
            res.body[0].name.should.equal('Administrator');
            done(err);
          });
      });

      it('should filter on != sign', function (done) {
        request(app)
        .get(apiRoute + '?filters=name!=Administrator')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(roles.length - 1);
            done(err);
          });
      });

      it('should filter on ~ sign (like)', function (done) {
        request(app)
        .get(apiRoute + '?filters=description~User')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(2);
            done(err);
          });
      });

      it('should filter on !~ sign (not like)', function (done) {
        request(app)
        .get(apiRoute + '?filters=description!~User')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(3);
            done(err);
          });
      });

      it('should filter on [] sign (in)', function (done) {
        request(app)
        .get(apiRoute + '?filters=name[root,Administrator]')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(2);
            done(err);
          });
      });

      it('should filter on ][ sign (not in)', function (done) {
        request(app)
        .get(apiRoute + '?filters=name]root,Administrator[')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.length.should.equal(3);
            done(err);
          });
      });

    });

    describe('Sorting', function () {
      function sortRoles (roles) {
        return roles.concat().sort(function (a, b) {
          if (a.name === b.name) {
            if (a.description < b.description) {
              return 1;
            } else {
              if (a.description > b.description) {
                return -1;
              }
            }
            return 0;
          } else {
            if (a.name > b.name) {
              return 1;
            }

            if (a.name < b.name) {
              return -1;
            }
          }
        });
      }

      it('should sort on given properties', function (done) {
        var sortedRoles = sortRoles(roles);
        request(app)
        .get(apiRoute + '?sort=name,-description')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body[0].name.should.equal(sortedRoles[0].name);
            res.body[3].name.should.equal(sortedRoles[3].name);
            done(err);
          });
      });

      it('should sort when given an object', function (done) {
        var sortedRoles = sortRoles(roles);
        request(app)
        .get(apiRoute + '?sort[name]=asc&sort[description]=desc')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body[0].name.should.equal(sortedRoles[0].name);
            res.body[3].name.should.equal(sortedRoles[3].name);
            done(err);
          });
      });
    });

    describe('GET /{id}', function () {
      it('should return a document when given its id', function (done) {
        request(app)
          .get(apiRoute + '/' + doc.id)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.should.have.properties(Object.keys(doc));
            res.body.should.have.properties('permissions');
            res.body.permissions[0].should.have.properties(['name','id','href']);
            res.body.id.should.equal(doc.id);
            done(err);
          });
      });

      it('should return requested fields', function (done) {
        var requestedFields = ['name','description', 'active'];
        request(app)
          .get(apiRoute + '/' + doc.id + '?fields=name,description,active')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.should.have.properties(requestedFields);
            res.body.should.not.have.properties('permissions');
            res.body.id.should.equal(doc.id);
            done(err);
          });
      });

      it('should be able to embed sub documents', function (done) {
        request(app)
          .get(apiRoute + '/' + doc.id + '?embed=permissions.name,permissions.active')
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.should.have.properties('permissions');
            res.body.permissions[0].should.have.properties(['name','active']);
            res.body.permissions[0].should.not.have.properties(['description']);
            res.body.id.should.equal(doc.id);
            done(err);
          });
      });

      it('should return 400 when given an invalid id', function (done) {
        var fakeId = '0123';
        request(app)
          .get(apiRoute + '/' + fakeId)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.should.have.properties(['errors','code', 'message']);
            done(err);
          });
      });

      it('should return 404 when given an non existing id', function (done) {
        var doc = new Role(createRole({ name: 'Role 1', builtIn: false }));
        request(app)
          .get(apiRoute + '/' + doc._id)
          .expect(404)
          .end(function (err, res) {
            should.not.exist(res.body);
            should.not.exist(err);
            done(err);
          });
      });
    });

  });

  describe('POST', function () {
    it('should create a document and return it', function (done) {
      var doc = createRole({ name: 'Role 1', builtIn: false });
      request(app)
        .post(apiRoute)
        .send(doc)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(doc);
          done(err);
        });
    });

    it('should ignore extra proprties not defined on the model', function (done) {
      var doc = createRole({ name: 'Role 10', builtIn: false });
      doc.fakeProperty = 'Fake value';
      request(app)
        .post(apiRoute)
        .send(doc)
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.not.have.property(doc.fakeProperty);
          done(err);
        });
    });

    it('should return errors if they occur', function (done) {
      var doc = createRole({ name: 'Role 1', builtIn: false });
      doc.name = null;
      request(app)
        .post(apiRoute)
        .send(doc)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(['name', 'errors','code','message']);
          res.body.name.should.equal('ValidationError');
          done(err);
        });
    });
  });

  describe('PUT', function () {
    it('should update a document and return the updated version', function (done) {
      getRandomDoc().then(function (doc) {
        doc.description = 'Updated the description for this role';
        request(app)
          .put(apiRoute + '/' + doc.id)
          .send(doc)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.description.should.equal(doc.description);
            done(err);
          });
      });
    });

    it('should return 404 when trying to update an non existing id', function (done) {
      var doc = new Role(createRole({ name: 'Role 1', builtIn: false }));
      request(app)
        .put(apiRoute + '/' + doc._id)
        .send(doc)
        .expect(404)
        .end(function (err, res) {
          should.not.exist(err);
          should.not.exist(res.body);
          done(err);
        });
    });

    it('should return 400 when given an invalid id', function (done) {
      var fakeId = '0123';
      var doc = new Role(createRole({ name: 'Role 1', builtIn: false }));
      request(app)
        .put(apiRoute + '/' + fakeId)
        .send(doc)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(['errors','code', 'message']);
          done(err);
        });
    });
  });

  describe('DELETE', function () {
    var tobeDeleted;
    it('should delete a document', function (done) {
      getRandomDoc().then(function (doc) {
        request(app)
          .delete(apiRoute + '/' + doc.id)
          .expect(204)
          .end(function (err, res) {
            tobeDeleted = doc;
            should.not.exist(err);
            res.body.should.be.empty();
            done(err);
          });
      });
    });

    it('should return 400 when given an invalid id', function (done) {
      var fakeId = '0123';
      request(app)
        .delete(apiRoute + '/' + fakeId)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Object);
          res.body.should.have.properties(['errors','code', 'message']);
          done(err);
        });
    });

    it('should return 404 if the deleted document does not exist', function (done) {
      request(app)
      .delete(apiRoute + '/' + tobeDeleted.id)
        .expect(404)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.empty();
          done(err);
        });
    });
  });

});
