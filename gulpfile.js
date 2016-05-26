var gulp = require('gulp');
var path = require('path');

//css
var compass = require('gulp-compass'),
   sass = require('gulp-sass'),
   // sourcemaps = require('gulp-sourcemaps'),
   // postcss = require('gulp-postcss'),
   // scss = require('postcss-scss'),
   autoprefixer = require('gulp-autoprefixer'),
   minifycss  = require('gulp-cssnano'),
   watch = gulp.watch,
   gutil = require('gulp-util');

//js
var uglify = require('gulp-uglify');

const JS_BUILD_DIR = path.resolve(__dirname, './public/js');
const CSS_BUILD_DIR = path.resolve(__dirname, './public/css');


gulp.task('watch-css', ['dev-css'], function() {
   gulp.watch('./styles/**/*',  ['dev-css']);
});
gulp.task('dev-css', function() {
   return gulp.src('./styles/**/*.scss')
      .pipe(compass({
         sass     : './styles',
         css      : CSS_BUILD_DIR,
         logging  : true,
         comments : true,
      }))
      // .pipe(maps.init())
      // .pipe(sass())
      // .on('error', function(err) {
      //    gutil.log("[dev]", err.toString());
      //    this.emit('end'); //resumes watch after error
      // })
      .pipe(autoprefixer())
      // .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
      // .pipe(maps.write('.'))
      .pipe(gulp.dest(CSS_BUILD_DIR))
});
gulp.task('css-prod', function() {
   return gulp.src(['./styles/**/*.scss'])
      .pipe(compass({
         sass     : './styles/',
         css      : CSS_BUILD_DIR,
         logging  : false,
         comments : false,
         style    : 'compressed'
      }))
      .on('error', function(err) {
         gutil.log("[production]", err.toString());
      })
      .pipe(autoprefixer())
      .pipe(minifycss())
      .pipe(gulp.dest(CSS_BUILD_DIR));
});


gulp.task('watch-js', ['dev-js'], function() {
   gulp.watch('./scripts/**/*',  ['dev-js']);
});
gulp.task('dev-js', function() {
   return gulp.src(['./scripts/**/*.js'])
      .pipe(gulp.dest(JS_BUILD_DIR));
});
gulp.task('js-prod', function(){
   return gulp.src(['./scripts/**/*.js'])
      .pipe(uglify()) //compresses js files
      .on('error', function(err) {
         gutil.log("[js production]", err.toString());
      })
      .pipe(gulp.dest(JS_BUILD_DIR));
});
