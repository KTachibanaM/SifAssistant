var gulp = require('gulp');
var babel = require("gulp-babel");
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sh = require('shelljs');

var src = {
    jsx: ['./www/components/**/*.jsx']
};

var dist = {
    jsx: './www/js/transformed'
};

gulp.task('default', ['babel']);

gulp.task('watch', function () {
    gulp.watch(src.jsx, ['babel']);
});

gulp.task('babel', function () {
    return gulp.src(src.jsx)
        .pipe(babel())
        .pipe(gulp.dest(dist.jsx));
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});