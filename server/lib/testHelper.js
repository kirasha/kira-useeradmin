'use strict';

var mongoose    = require('mongoose'),
    config = require('../config/environment');

exports.prepare = function (model, done) {
  mongoose.connect(config.mongo.uri, config.mongo.options);
  exports.clean(model, done);
};

exports.end = function (done) {
  mongoose.connection.close(done);
};

exports.clean = function (model, done) {
  if (!done) {
    done = model;
    model = null;
  }

  if (model) {
    return model.remove().exec().then(function () {
      done();
    });
  }

  done();
};
