/* gulpfile.js */
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  inject = require('gulp-inject'),
  series = require('stream-series');

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
    in: source + 'scss/**/*.scss',
    vendor: source + 'vendor/**/*.scss',
    out: dest + 'css/',
    outVendor: dest + 'css/vendor',
    watch: source + 'scss/**/*',
    sassVendorOpts: {
      outputStyle: 'compressed',
      precison: 3,
      errLogToConsole: false,
      includePaths: [bootstrapSass.in + 'assets/stylesheets']
    },
    sassOpts: {
      outputStyle: 'expanded',
      precison: 3,
      errLogToConsole: true
    }
  };

// copy bootstrap required fonts to dest
gulp.task('fonts', function () {
  'use strict';

  return gulp
    .src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// compile vendor
gulp.task('sassVendor', ['fonts'], function () {
  'use strict';
  return gulp.src(scss.vendor)
    .pipe(sass(scss.sassVendorOpts))
    .pipe(gulp.dest(scss.outVendor));
});

// compile scss
gulp.task('sass', function () {
  'use strict';
  return gulp.src(scss.in)
    .pipe(sass(scss.sassOpts))
    .pipe(gulp.dest(scss.out));
});

gulp.task('html', ['sassVendor', 'sass'], function () {
  'use strict';
  var vendorCss = gulp.src(['dist/css/vendor/**/*.css'], { read: false }),
    appCss = gulp.src(['dist/css/*.css'], { read: false });

  return gulp.src('src/index.html')
    .pipe(inject(series(vendorCss, appCss)))
    .pipe(gulp.dest('dist'));
});

// default task
gulp.task('default', ['html'], function () {
  'use strict';
});
