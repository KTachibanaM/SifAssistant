var gulp = require('gulp');
var babel = require("gulp-babel");
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

gulp.task('default', ['babel']);

gulp.task('watch', function () {
    gulp.watch(src.jsx, ['babel']);
});

gulp.task('babel', function () {
    return gulp.src(src.jsx)
        .pipe(babel())
        .pipe(gulp.dest(dist.js));
});