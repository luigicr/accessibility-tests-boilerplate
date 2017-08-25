/* gulpfile.js */
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  inject = require('gulp-inject'),
  series = require('stream-series'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  del = require('del'),
  fs = require('fs'),
  eslint = require('gulp-eslint'),
  image = require('gulp-imagemin');

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
  },
  // Our scss source folder: .scss files
  js = {
    in: source + 'js/**/*.js',
    inVendor: source + 'vendor/**/*.js',
    out: dest + 'js/',
    outVendor: dest + 'js/vendor',
    watch: source + 'js/**/*',
    globals: ['$', 'jQuery', 'M']
  };
  // Our scss source folder: .scss files
  img = {
    in: source + 'img/**/*.+(png|jpg|gif|svg)',
    out: dest + 'images/',
    watch: source + 'img/**/*'
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

// compile js vendor
gulp.task('js', function() {
  gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
    js.inVendor
  ]).pipe(uglify())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(js.outVendor));

  return gulp.src([js.in])
    .pipe(concat('script.js'))
    .pipe(gulp.dest(js.out));
});

gulp.task('es-lint', function () {
  var file = fs.createWriteStream('report-es-lint.html');
  return gulp.src(
    [js.in])
  .pipe(eslint({
    globals: js.globals
  }))
  .pipe(eslint.format())
  .pipe(eslint.formatEach('html', file))
  .pipe(eslint.failAfterError());
});

gulp.task('images', function(){
  return gulp.src(img.in)
  .pipe(image())
  .pipe(gulp.dest(img.out))
});

gulp.task('html', ['sassVendor', 'sass', 'js', 'es-lint', 'images'], function () {
  'use strict';
  var vendorCss = gulp.src(['dist/css/vendor/**/*.css'], { read: false }),
    appCss = gulp.src(['dist/css/*.css'], { read: false }),
    vendorJs = gulp.src(['dist/js/vendor/**/*.js'], { read: false }),
    appJs = gulp.src(['dist/js/*.js'], { read: false });

  return gulp.src('src/index.html')
    .pipe(inject(series(vendorCss, appCss, vendorJs, appJs)))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['dist/**/*.*']);
});

// default task
gulp.task('default', ['clean', 'html'], function () {
  'use strict';
});
