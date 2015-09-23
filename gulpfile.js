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

gulp.task('jsx-js', function () {
    return gulp.src(src.js)
        .pipe(babel())
        .on('error', function (e) {
            console.error('jsx-js task error', e);
            this.emit('end');
        })
        .pipe(gulp.dest(dist.js));
});