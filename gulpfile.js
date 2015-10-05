var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

var JS_SRC = ['./www/js/**/*.js', './www/js/**/*.jsx'];
var JS_ENTRY_POINT = './www/js/ionic-bootstrap.jsx';
var JS_BUNDLE = './www/bundle.js';

gulp.task('default', ['build']);

gulp.task('watch', function () {
    gulp.watch(JS_SRC, ['build']);
});

gulp.task('build', function () {
    return browserify({
        entries: [JS_ENTRY_POINT],
        transform: babelify
    })
        .bundle()
        .pipe(source(JS_BUNDLE))
        .pipe(gulp.dest('.'));
});