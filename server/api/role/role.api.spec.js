'use strict';

var should    = require('should'),
    request   = require('supertest'),
    app       = require('../../app').app,
    server    = require('../../app').server;

describe('Roles API', function () {
  before(function (done) {
    done();
  });

  after(function (done) {
    // server.close(done);
    done();
  });

  it('GET /roles should respond with JSON with correct status', function (done) {
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
});
