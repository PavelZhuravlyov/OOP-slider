  var 
      gulp = require('gulp'),

      stylus = require('gulp-stylus'),

      concat = require('gulp-concat'),

      autoprefixer = require('gulp-autoprefixer'),

      sourcemaps = require('gulp-sourcemaps'),

      uncss = require('gulp-uncss'),

      watch = require('gulp-watch'),

      del = require('del'),

      notify = require('gulp-notify'),

      remember = require('gulp-remember'),

      debug = require('gulp-debug'),

      path = require('path'),

      browserSync = require('browser-sync').create();


    
    gulp.task('html', function(){
        return gulp.src('development/**/*.html')
            .pipe(gulp.dest('public'));
    });

    gulp.task('styles', function() {
        return gulp.src('development/styles/**/*.styl', { since: gulp.lastRun('styles') })
            .pipe(sourcemaps.init())
            .pipe(remember('styles'))
            .pipe(concat('style.styl'))
            .pipe(stylus()).on('error', notify.onError({
                title: "Stylus"
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('public/css'));
    });

    gulp.task('serve', function() {
        browserSync.init({
            server: 'public'
        });
        browserSync.watch('public/**/*.*').on('change', browserSync.reload);
    });

    gulp.task('build', gulp.parallel('html', 'styles'));

    gulp.task('watch', function() {
        gulp.watch('development/styles/**/*.styl', gulp.series('styles')).on('unlink', function(filepath) {
            remember.forget('styles', path.resolve(filepath));
        });
        gulp.watch('development/**/*.html', gulp.series('html'));
    });

    gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));
