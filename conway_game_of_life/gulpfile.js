var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");

// Parse JS using Babel
gulp.task("default", function () {
  return gulp.src("src/gol.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("gol.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

// Watch all JS and compile on change
gulp.task('watch', function() {
  gulp.watch('src/*.js', ['default']);
});