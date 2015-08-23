var request   = require('supertest'),
    should    = require('should'),
    app       = require('../../app').app,
    server    = require('../../app').server;

describe('Permissions API', function () {
  before(function (done) {
    done();
  });

  after(function (done) {
    // server.close(done);
    done();
  });

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

});

