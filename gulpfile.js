var gulp = require('gulp');
var react = require('gulp-react');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sh = require('shelljs');

var src = {
    jsx: ['./www/js/**/*.jsx']
};

var dist = {
    js: './www/dist'
};

gulp.task('default', ['react']);

gulp.task('watch', function () {
    gulp.watch(src.jsx, ['react']);
});

gulp.task('react', function () {
    return gulp.src(src.jsx)
        .pipe(react())
        .pipe(gulp.dest(dist.js));
});