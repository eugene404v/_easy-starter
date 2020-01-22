"use strict";

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const fileinclude = require('gulp-file-include');

gulp.task('html', function(callback) {
    return gulp.src('./src/html/*.html')
        .pipe(plumber({
            errorHandler: notify.onError(function(err){
                return{
                    title: 'HTML include',
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(fileinclude({prefix: '@@'}))
      .pipe(gulp.dest('./build/'))
    callback();
});

gulp.task('sass', function (callback) {
    return gulp.src('./src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: notify.onError(function(err){
                return{
                    title: 'SCSS compilation',
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
    callback();
});

gulp.task('copy:img', function(callback) {
    return gulp.src('./src/img/**/*.*')
      .pipe(gulp.dest('./build/img/'))
      callback();
});

gulp.task('copy:js', function(callback) {
    return gulp.src('./src/js/**/*.*')
      .pipe(gulp.dest('./build/js/'))
      callback();
});

gulp.task('watch', function () {
    watch(['./build/*.html', './build/css/**/*.css'], gulp.parallel(browserSync.reload));
    watch('./src/scss/**/*.scss', function(){
        setTimeout(gulp.parallel('sass'), 1000);
    });
    watch('./src/html/**/*.html', gulp.parallel('html'));
});

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
});

gulp.task('default', gulp.series(
    gulp.parallel('sass', 'html', 'copy:img', 'copy:js'),
    gulp.parallel('server', 'watch')
));
