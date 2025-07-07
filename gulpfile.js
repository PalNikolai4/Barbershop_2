import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import sourcemap from 'gulp-sourcemaps';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin, {mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import {deleteAsync} from 'del';
import svgstore from 'gulp-svgstore';


// Styles
const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write('.'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// IMG
const imgOptimized = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      optipng({optimizationLevel: 3}),
      mozjpeg({quality: 85, progressive: true}),
      svgo()
    ]))
    .pipe(gulp.dest('build/img'));
}

const imgCopy = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(gulp.dest('build/img'));
}

// WebP
const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'));
}

// Sprite
const sprite = () => {
  return gulp.src('source/img/icons/*svg')
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(gulp.dest('build/img'));
}

// Copy
const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/img/**/*.svg'
  ],
    {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
  done();
}

// Clean
const clean = () => {
  return deleteAsync('build');
}

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build
export const build = gulp.series(
  clean,
  copy,
  imgOptimized,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp,
    sprite
  )
)

// Default
export default gulp.series(
  clean,
  copy,
  imgCopy,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp,
    sprite
  ),
  gulp.series(
  server,
  watcher
  )
);
