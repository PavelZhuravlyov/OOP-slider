gulp = require 'gulp'
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'
autoprefixer = require 'gulp-autoprefixer'
jade = require 'gulp-jade'
sourcemaps = require 'gulp-sourcemaps'
uncss = require 'gulp-uncss'
watch = require 'gulp-watch'
del = require 'del'
notify = require 'gulp-notify'
remember = require 'gulp-remember'
debug = require 'gulp-debug'
path = require 'path'
browserSync = require 'browser-sync'
	.create()

gulp.task 'jade', -> 
	gulp.src 'development/temp/**/*.jade', { since: gulp.lastRun 'jade' }
		.pipe debug {title: "Jade:"}
		.pipe jade()
			.on 'error', notify.onError {
				title: "Jade"
			}
		.pipe gulp.dest 'public/'

gulp.task 'styles', ->
	gulp.src 'development/styles/**/*.styl', { since: gulp.lastRun 'styles' }
		.pipe sourcemaps.init()
		.pipe remember 'styles'
		.pipe concat 'style.styl'
		.pipe stylus()
			.on 'error', notify.onError {
				title: "Stylus"
			}
		.pipe sourcemaps.write()
		.pipe gulp.dest 'public/css'

gulp.task 'serve', ->
	browserSync.init {
		server: {
			baseDir: 'public',
			index: "userProf.html"
		}
	}

	browserSync.watch 'public/**/*.*'
		.on 'change', browserSync.reload
	return

gulp.task 'build', gulp.parallel 'jade', 'styles' 

gulp.task 'watch', ->
	gulp.watch 'development/styles/**/*.styl', gulp.series 'styles'
		.on 'unlink', (filepath) ->
			remember.forget 'styles', path.resolve filepath
			return

	gulp.watch 'development/temp/**/*.jade', gulp.series 'jade'
		.on 'unlink', (filepath) ->
			remember.forget 'jade', path.resolve filepath
			return

gulp.task 'default', gulp.series 'build', gulp.parallel 'serve', 'watch'