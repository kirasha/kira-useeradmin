'use strict';

/**
 * Utilities for unit testing
 * @module TestHelper
 * @author diokey <diokeyolivier@gmail.com>
 */

var mongoose    = require('mongoose'),
    config = require('../config/environment');

/**
 * Prepares the model before running unit test. Tt will establish mongoose connection
 * and cleans {@link clean} up the model so that unit test can start in a clean state
 * @param {Object} model The model to prepare. (Can be an array of models)
 * @param {function} done The callback to call when done
 */
exports.prepare = function (model, done) {
  mongoose.connect(config.mongo.uri, config.mongo.options);
  exports.clean(model, done);
};

/**
 * End the units test by closing the connection to mongodb, create by clean {@link prepare}
 * @param {function} done The callback to call when done
 */

exports.end = function (done) {
  mongoose.connection.close(done);
};

/**
 * Cleans the the model to make sure that unit tests start with a clean state.
 * @param {Object} model The model to clean (Can be an array of models)
 * @param {function} done The callback to call when done
 */

exports.clean = function (model, done) {
  if (!done) {
    done = model;
    model = null;
  }

  if (model) {
    if (Array.isArray(model)) {

      var promises = model.map(function (m) {
        return m.remove().exec();
      });

      Promise.all(promises).then(function () {
        done();
      }).catch(function (err) {
        done(err);
      });

    } else {
      return model.remove().exec().then(function () {
        done();
      });
    }
  }
};
