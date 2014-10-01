'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var browserifyProtect = require('gulp-browserify-protect');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr');
var server = tinylr();
var jade = require('gulp-jade');
var path = require('path');
var express = require('express');
var app = express();
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var s3 = require('gulp-s3');
var d3 = require('d3');
var gzip = require('gulp-gzip');
var colors = require('colors');
var rename = require('gulp-rename');
var _ = require('lodash');

var srcDir = 'ui/';
var appServer;


var PRODUCTION_MODE = gutil.env.production;
var projectName = require('./package').name;


gulp.task('js-lib', function() {
    return gulp.src(srcDir + 'js/lib/**/*.js')
            .pipe(gulpif(PRODUCTION_MODE, uglify()))
            .pipe(gulp.dest('./public/js/lib/'))
            .pipe( livereload( server ));
});

gulp.task('gzip', ['build'], function() {
    return gulp.src('public/**/*.{js,css}')
                .pipe(gzip())
                .pipe(rename(function(path) {
                    path.extname = '';
                }))
                .pipe(gulp.dest('./public/'));
});

gulp.task('browserify', function() {

    gulp.src(srcDir + 'js/pages/*.js')
        .pipe(browserify({
            debug: !PRODUCTION_MODE,
            external: ['scatter', 'roi']
        }))
        .on('error', gutil.log)
        .on('error', gutil.beep)
        .pipe(gulpif(PRODUCTION_MODE, uglify()))
        .pipe(browserifyProtect())
        .pipe(gulp.dest('./public/js/'))
        .pipe( livereload( server ));

    return gulp.src(srcDir + 'js/app.js')
        .pipe(browserify({
            debug : !PRODUCTION_MODE
        }))
        .on('error', gutil.log)
        .on('error', gutil.beep)
        .pipe(gulpif(PRODUCTION_MODE, uglify()))
        .pipe(browserifyProtect())
        .pipe(gulp.dest('./public/js/'))
        .pipe( livereload( server ));
});


gulp.task('css', function() {
    return gulp
            .src(srcDir + 'stylesheets/app.scss')
            .pipe(
                sass({
                    includePaths: ['src/stylesheets'],
                    errLogToConsole: true
                }))
            .pipe( gulpif(PRODUCTION_MODE, csso()) )
            .pipe( gulp.dest('./public/css/') )
            .pipe( livereload( server ));
});


gulp.task('fonts', function() {
    return gulp
            .src(srcDir + 'fonts/**/*.{otf,svg,ttf,woff,eot}')
            .pipe( gulp.dest('./public/fonts/') )
            .pipe( livereload( server ));
});

gulp.task('images', function() {
    return gulp
            .src(srcDir + 'images/**/*')
            .pipe( gulp.dest('./public/images/') )
            .pipe( livereload( server ));
});

gulp.task('jade', function() {

    // delete require.cache[require.resolve('./' + srcDir + 'js/utils')];
    // var utils = require('./' + srcDir + '/js/utils');

    if(!PRODUCTION_MODE) {
        host = '/';
    }
    
    return gulp.src(srcDir + '**/index.jade')
               .pipe(jade({
                    pretty: !PRODUCTION_MODE,
                    locals: {
                        // utils: utils,
                        d3: d3,
                        STATIC_URL: host,
                        _: _
                    }
               }))
               .on('error', gutil.log)
               .on('error', gutil.beep)
               .pipe(gulp.dest('./public/'))
               .pipe( livereload( server ));
});

gulp.task('templates', ['static']);


gulp.task('express', function() {
    if(appServer) {
        try {
            appServer.close();
        } catch(e) {}
    }
    delete require.cache[require.resolve('./server')];
    appServer = require('./server');
});
 
gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }
 
    gulp.watch(srcDir + 'stylesheets/**/*.{scss,css}',['css']);
    gulp.watch(srcDir + 'js/**/*.js',['js']);
    // gulp.watch(srcDir + 'templates/**/*.jade',['jade', 'js']);
  });
});


gulp.task('gzip', ['build'], function() {
    return gulp.src('public/**/*.{js,css}')
                .pipe(gzip())
                .pipe(rename(function(path) {
                    path.extname = '';
                }))
                .pipe(gulp.dest('./public/'));
});


gulp.task('js', ['browserify','js-lib']);
gulp.task('static', ['js', 'css', 'fonts', 'images']);
gulp.task('default', ['templates','watch']);
gulp.task('build', ['templates']);
gulp.task('heroku:production', ['templates']);


