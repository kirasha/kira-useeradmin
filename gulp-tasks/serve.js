'use strict';

var gulp      = require('gulp'),
    nodemon   = require('gulp-nodemon'),
    bsync     = require('browser-sync'),
    reload    = bsync.reload,
    lint      = require('./lint'),
    config    = require('../server/config/environment');

var BS_RELOAD_TIME = 2000;

var openOptions = {
  url: 'http://localhost:' + config.port,
  started: false
};

module.exports = {
  nodemon: function (cb) {
    return nodemon({
      script: 'server/app.js',
      ext: 'js',
      ignore: ['client','gulp-tasks','dist','node_modules']
    })
    .on('start', function () {
      if (!openOptions.started) {
        openOptions.started = true;
        // wait 3 secs before starting for the server to be ready
        setTimeout(cb, BS_RELOAD_TIME);
      } else {
        setTimeout(function () {
          reload();
        }, BS_RELOAD_TIME);
      }

    });
  },

  browserSync: function () {
    bsync.init({
      proxy: openOptions.url,
      port: 4000,
      browser: process.env.BROWSER || 'google-chrome'
    });
    // watch ressources
    gulp.watch(['server/**/*.js'], lint);
  }

};

