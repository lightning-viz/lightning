'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var srcDir = 'ui/';
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserifyProtect = require('gulp-browserify-protect');

var PRODUCTION_MODE = gutil.env.production;

gulp.task('js-lib', function() {
    return gulp.src(srcDir + 'js/lib/**/*.js')
            .pipe(gulpif(PRODUCTION_MODE, uglify()))
            .pipe(gulp.dest('./public/js/lib/'))
            .pipe( livereload( server ));
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
        .pipe(gulp.dest('./public/js/'))
        .pipe( livereload( server ));

    return gulp.src(srcDir + 'js/app.js')
        .pipe(browserify({
            debug : !PRODUCTION_MODE
        }))
        .on('error', gutil.log)
        .on('error', gutil.beep)
        .pipe(gulpif(PRODUCTION_MODE, uglify()))
        .pipe(gulp.dest('./public/js/'))
        .pipe( livereload( server ));
});

gulp.task('standalone-js', function() {
    var browserify = require('browserify');
    var b = browserify({
        entries: srcDir + 'js/etc/standalone.js',
        debug: false
    });

    return b.bundle()
        .pipe(source('standalone.js'))
        .pipe(buffer())
        .pipe(browserifyProtect())
        // .pipe(uglify())
        // .on('error', gutil.log)
        .pipe(gulp.dest('.'));

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

gulp.task('watch', function () {
  var tinylr = require('tiny-lr');
  var server = tinylr();
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }
 
    gulp.watch(srcDir + 'stylesheets/**/*.{scss,css}',['css']);
    gulp.watch(srcDir + 'js/**/*.js',['js']);
  });
});


gulp.task('js', ['browserify','js-lib']);
gulp.task('static', ['js', 'css', 'fonts', 'images']);
gulp.task('default', ['static','watch']);
gulp.task('build', ['static']);
gulp.task('heroku:production', ['static']);


