  var 
      gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      concat       = require('gulp-concat'),
      autoprefixer = require('gulp-autoprefixer'),
      sourcemaps   = require('gulp-sourcemaps'),
      watch        = require('gulp-watch'),
      notify       = require('gulp-notify'),
      remember     = require('gulp-remember'),
      path         = require('path'),
      browserSync  = require('browser-sync').create();
 
    gulp.task('html', function() {
        return gulp.src('development/**/*.html')
            .pipe(gulp.dest('public'));
    });

    gulp.task('sass', function() {
        return gulp.src('development/styles/**/*.scss', { since: gulp.lastRun('sass') })
            .pipe(sourcemaps.init())
            .pipe(remember('sass'))
            .pipe(concat('style.scss'))
            .pipe(sass()).on('error', notify.onError({
                title: "SASS"
            }))
            .pipe(autoprefixer({
              browsers: ['Last 2 versions', 'Firefox <= 20', 'IE <= 10'],
              cascade: false
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('public/css'));
    });

    gulp.task('concatJS', function() {
      return gulp.src(['./development/js/error.js', './development/js/slider.js', './development/js/prevSlider.js', './development/js/main.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./public/js/'));
    });

    gulp.task('serve', function() {
        browserSync.init({
            server: 'public'
        });
        browserSync.watch('public/**/*.*').on('change', browserSync.reload);
    });

    gulp.task('build', gulp.parallel('html', 'sass', 'concatJS'));

    gulp.task('watch', function() {
        gulp.watch('development/styles/**/*.scss', gulp.series('sass')).on('unlink', function(filepath) {
            remember.forget('sass', path.resolve(filepath));
        });
        gulp.watch('development/**/*.html', gulp.series('html'));
        gulp.watch('development/**/*.js', gulp.series('concatJS'));
    });

    gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));
