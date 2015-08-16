'use strict';

var request     = require('supertest'),
    should      = require('should'),
    app         = require('../../app').app,
    server      = require('../../app').server;

describe('User API /api/users', function () {

  before(function (done) {
    // start the server
    done();
  });

  after(function (done) {
    server.close(done);
  });

  it('Should respond with JSON with correct status', function (done) {
    request(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(0);
        done(err);
      });
  });
});
