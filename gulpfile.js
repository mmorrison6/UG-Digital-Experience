var gulp = require('gulp');
var gulpIf = require('gulp-if');
var changed = require('gulp-changed');
var jshint = require('gulp-jshint');
var fileinclude = require('gulp-file-include');
var minifyHTML = require('gulp-minify-html');
var useref = require('gulp-useref');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpSequence = require('gulp-sequence');
var browserSync = require('browser-sync').create();
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var requireDir = require('require-dir');

var config = {
    devDir: './development',
    deployDir: './deploy',

};

gulp.task('lint', function() {
  return gulp.src('./development/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src('./development/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest(config.deployDir + '/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.deployDir + '/js'));
});

gulp.task('fileinclude', function() {
  gulp.src(['./development/*.html'])
    .pipe(fileinclude())
    .pipe(gulp.dest('./deploy'));
});

gulp.task('sass', function() {
    return gulp.src(config.devDir + '/scss/**/*.scss')
    .pipe(sourcemaps.init())  // Process the original sources
		.pipe(sass())
		.pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest(config.deployDir + '/css'));
});

gulp.task('fonts', function() {
    return gulp.src(config.devDir + '/fonts/**/*')
    .pipe(gulp.dest(config.deployDir + '/fonts'));
});

gulp.task('useref', function() {
  return gulp.src('./development/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(config.deployDir));
});

gulp.task('index', ['useref'], function () {
  var target = gulp.src('./development/*.html');
  var sources = gulp.src(['./deploy/js/**/*.js', './deploy/css/**/*.css'], {read: false});
 	return target.pipe(inject(sources, {ignorePath: 'deploy/', addRootSlash: false}))
 	.pipe(gulpIf('*.html', fileinclude({prefix: '@@', basepath: '@file'})))
	.pipe(gulp.dest(config.deployDir));
});

gulp.task('images', function(){
  return gulp.src('development/images/**/*.+(png|jpg|gif|svg)')
  .pipe(gulp.dest('deploy/images'))
});

gulp.task('html-watch', ['index'], function() {
    browserSync.reload();
});

gulp.task('sass-watch', ['sass'], function() {
    browserSync.reload();
});

gulp.task('js-watch', ['minify'], function() {
    browserSync.reload();
});

gulp.task('serve', ['lint', 'sass', 'index', 'minify'], function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./deploy"
        }
    });
    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch('./development/**/*.html', ['html-watch']);
		gulp.watch(config.devDir + '/scss/**/*.scss', ['sass-watch']);
		gulp.watch(config.devDir + '/js/**/*.js', ['js-watch']);
});

gulp.task('default', gulpSequence(['serve', 'fonts']));


//END GULP.JS
