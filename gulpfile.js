'use strict';

var gulp = require('gulp');

// process.env.NODE_ENV = process.env.NODE_ENV || 'development';

gulp.task('lint', require('./gulp-tasks/lint'));
gulp.task('tests', require('./gulp-tasks/test').tests);
gulp.task('tests:e2e', require('./gulp-tasks/test').e2eTests);
gulp.task('watchTests', require('./gulp-tasks/test').watchTests);
gulp.task('nodemon', ['lint','tests'], require('./gulp-tasks/serve').nodemon);
gulp.task('browserSync', ['nodemon'], require('./gulp-tasks/serve').browserSync);
gulp.task('serve', ['browserSync']);
gulp.task('default', ['serve']);
