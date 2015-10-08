var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

const paths = {
    srcEntry: './www/js/ionic-bootstrap.js',
    srcJs: './www/js/**/*.js',
    distBundle: './www/dist/bundle.min.js'
};

gulp.task('default', ['build']);

gulp.task('watch', function () {
    gulp.watch(paths.srcJs, ['build']);
});

gulp.task('build', ['browserify']);

gulp.task('clean', function (cb) {
    del(paths.distBundle, cb);
});

gulp.task('browserify', function () {
    browserify(paths.srcEntry)
        .transform(babelify)
        .bundle()
        .pipe(source(paths.distBundle))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
});