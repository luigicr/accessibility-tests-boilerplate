/* gulpfile.js */
var gulp = require('gulp'),
  sass = require('gulp-sass');


// source and distribution folder
// eslint-disable-next-line one-var
var source = 'src/',
  dest = 'dist/',
  // Bootstrap scss source
  bootstrapSass = {
    in: './node_modules/bootstrap-sass/'
  },
  // Bootstrap fonts source
  fonts = {
    in: [source + 'fonts/*.*', bootstrapSass.in + 'assets/fonts/**/*'],
    out: dest + 'fonts/'
  },
  // Our scss source folder: .scss files
  scss = {
    in: source + 'scss/main.scss',
    out: dest + 'css/',
    watch: source + 'scss/**/*',
    sassOpts: {
      outputStyle: 'expanded',
      precison: 3,
      errLogToConsole: true,
      includePaths: [bootstrapSass.in + 'assets/stylesheets']
    }
  };

// copy bootstrap required fonts to dest
gulp.task('fonts', function () {
  'use strict';

  return gulp
    .src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// compile scss
gulp.task('sass', ['fonts'], function () {
  'use strict';
  return gulp.src(scss.in)
    .pipe(sass(scss.sassOpts))
    .pipe(gulp.dest(scss.out));
});

// default task
gulp.task('default', ['sass'], function () {
  'use strict';
});
