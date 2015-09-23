var gulp = require('gulp');
var react = require('gulp-react');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sh = require('shelljs');

var src = {
    js: ['./www/js/**/*.js', './www/js/**/*.jsx']
};

var dist = {
    js: './www/dist'
};

gulp.task('default', ['react']);

gulp.task('watch', function () {
    gulp.watch(src.js, ['react']);
});

gulp.task('react', function () {
    return gulp.src(src.js)
        .pipe(react())
        .pipe(gulp.dest(dist.js));
});