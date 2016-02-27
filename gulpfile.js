var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sh = require('shelljs');
var gettext = require('gulp-angular-gettext');

gulp.task('default', []);

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
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

gulp.task('pot', function () {
    return gulp.src(['./www/templates/*.html', './www/js/*.js'])
        .pipe(gettext.extract('template.pot', {
            // options to pass to angular-gettext-tools...
        }))
        .pipe(gulp.dest('./po/'));
});

gulp.task('translations', function () {
    return gulp.src('./po/**/*.po')
        .pipe(gettext.compile({
            // options to pass to angular-gettext-tools...
            format: 'json'
        }))
        .pipe(gulp.dest('./www/js/translations/'));
});