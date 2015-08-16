'use strict';

/*
 * Lint files
 */

var gulp      = require('gulp'),
    fs        = require('fs'),
    _         = require('lodash'),
    async     = require('async'),
    jshint    = require('gulp-jshint'),
    jscs      = require('gulp-jscs'),
    jscsStylish = require('gulp-jscs-stylish');

module.exports = function () {

  function getConfig (file) {
    return _.merge(
      JSON.parse(fs.readFileSync('./.jshintrc', 'utf-8')),
      JSON.parse(fs.readFileSync(file, 'utf-8'))
    );
  }

  function lint (paths, conf) {
    return function (done) {
      gulp.src(paths)
        .pipe(jshint(conf))
        .pipe(jshint.reporter('jshint-stylish'))
        .on('finish', function () {
          gulp.src(paths)
            .pipe(jscs())
            .on('error', function () {})
            .pipe(jscsStylish())
            .on('end', done);
        });
    };
  }

  async.series([
    lint(['server/**/*.js'], getConfig('./server/.jshintrc')),
    lint(['gulpfile.js','gulp-tasks/**/*.js'], getConfig('./server/.jshintrc'))
  ]);

};
