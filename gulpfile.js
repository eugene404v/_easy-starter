//"use strict";

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const fileinclude = require('gulp-file-include');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const pug = require('gulp-pug');
const webpack = require("webpack-stream");


const dist = "./docs/";




gulp.task('html', function(callback) {
    return gulp.src('./src/*.html')
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'HTML include',
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(gulp.dest(dist))
    callback();
});

gulp.task('pug', function() {
    gulp.src('src/pug/*.pug')
        .pipe(pug({ pretty: '\t' }))
        .pipe(gulp.dest(dist))
});

gulp.task('sass', function(callback) {
    return gulp.src('./src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
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
        .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
        .pipe(gulp.dest(`${dist}css`))
    callback();
});

//gulp.task('copy:img', function(callback) {
//   return gulp.src('./src/img/**/*.*')
//    .pipe(gulp.dest('./dist/img/'))
//   callback();
//});

//gulp.task('copy:js', function(callback) {
// return gulp.src('./src/js/**/*.*')
//   .pipe(gulp.dest('./dist/js/'))
//   callback();
//});

gulp.task("build-js", () => {
    return gulp.src("./src/js/common.js")
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'common.js'
            },
            watch: false,
            devtool: "source-map",
            module: {
                rules: [{
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]
                            ]
                        }
                    }
                }]
            }
        }))
        .pipe(gulp.dest(dist))
        .on("end", browserSync.reload);
});

gulp.task("copy-assets", () => {
    return gulp.src("./src/assets/**/*.*")
        .pipe(gulp.dest(dist + "/assets"))
        .on("end", browserSync.reload);
});

/*gulp.task('webp', () =>
    gulp.src('src/assets/img/*.*')
    .pipe(webp())
    .pipe(gulp.dest('dist'))
);*/

gulp.task('compress', function(done) {
    gulp.src('src/assets/img/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest(`${dist}img`))
    done();
});


gulp.task('watch', function() {
    watch([`${dist}*.html`, `${dist}css/**/*.css`], gulp.parallel(browserSync.reload));
    watch('./src/scss/**/*.scss', function() {
        setTimeout(gulp.parallel('sass'), 1000);
    });
    watch('./src/html/**/*.html', gulp.parallel('html'));
    watch("./src/pug/**/*.pug", gulp.parallel("pug"));
    watch("./src/js/**/*.js", gulp.parallel("build-js"));
});

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: dist
        }
    });
});

gulp.task('default', gulp.series(
    gulp.parallel('sass', 'html', "build-js", "compress"),
    gulp.parallel('server', 'watch')
));



//, "copy-assets", "webp"