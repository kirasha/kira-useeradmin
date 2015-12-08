'use strict';
/*
 * Tests
 */

process.env.NODE_ENV = 'test';

var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    mocha   = require('gulp-mocha'),
    chalk   = require('chalk'),
    async   = require('async'),
    plumber = require('gulp-plumber');

/*
 * log util
 */

function log (msg, options) {
  options = options || {};
  console.log(
    (options.padding ? '\n' : '')
    + chalk.yellow(' > ' + msg)
    + (options.padding ? '\n' : ''));
}

function runTests (files, msg) {

  return function (done) {
    if (msg) {
      log(msg, { padding: true });
    }

    gulp.src(files, { read: false })
      .pipe(plumber())
      .pipe(mocha({ reporter: 'spec' }))
      .on('error', function (err) {
        gutil.log(err);
      })
      .on('end', done);
  };
}

function testServer (done) {
  async.series([
    runTests('server/**/*.model.spec.js', 'Running Server Model Spec')
  ], done);
}

function e2eTestServer (done) {
  async.series([
    runTests('server/lib/*/*.spec.js', 'CRUD Controller Spec'),
    runTests('server/**/*.api.spec.js', 'Running Server API Spec')
  ], done);
}

exports.tests = function (done) {
  return testServer(function () {
    e2eTestServer(function () {
      done();
      // process.exit(1);
    });
  });
};

exports.e2eTests = function (done) {
  return e2eTestServer(done);
};

exports.watchTests = function (done) {
  // run test when file change
  gulp.watch(['server/**/*.js'], function () {
    return testServer();
  });
  return testServer(done);
};
