var gulp = require('gulp'),
    del = require('del'),
    babel = require('gulp-babel');

var src = {
    js: ['./www/js/**/*.js', './www/js/**/*.jsx']
};

var dist = {
    js: './www/dist'
};

gulp.task('default', ['jsx-js']);

gulp.task('watch', function () {
    gulp.watch(src.js, ['jsx-js']);
});

gulp.task('clean-js', function () {
    return del([dist.js])
});

gulp.task('jsx-js', ['clean-js'], function () {
    return gulp.src(src.js)
        .pipe(babel())
        .pipe(gulp.dest(dist.js));
});