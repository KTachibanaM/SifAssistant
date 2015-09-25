var gulp = require('gulp'),
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

gulp.task('jsx-js', function () {
    return gulp.src(src.js)
        .pipe(babel())
        .pipe(gulp.dest(dist.js));
});
