var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

// Compile and minify SASS
gulp.task('css', function () {
  return gulp.src('./style/style.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest('./style'))
    .pipe(browserSync.stream());
});

// Server for local development
gulp.task('serve', function() {
  // Init browserSync
  browserSync.init({
    open: true,
    server : {
      baseDir : './',
      index : "index.htm"
    }  
  });

  // Watch files
  gulp.watch('./style/style.scss', ['css']);
  gulp.watch("*.htm").on('change', browserSync.reload);
});

gulp.task('default', ['css', 'serve']);