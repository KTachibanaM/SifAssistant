var gulp = require('gulp');
var babel = require('gulp-babel');

var src = {
    js: ['./www/js/**/*.js', './www/js/**/*.jsx']
};

var dist = {
    js: './www/dist'
};

gulp.task('default', ['babel']);

gulp.task('watch', function () {
    gulp.watch(src.js, ['babel']);
});

gulp.task('babel', function () {
    return gulp.src(src.js)
        .pipe(babel())
        .pipe(gulp.dest(dist.js));
});