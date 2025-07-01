import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import del from 'del';
import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import less from 'gulp-less';
import squoosh from 'gulp-libsquoosh';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import sourcemap from 'gulp-sourcemaps';
import svgstore from 'gulp-svgstore';
import terser from 'gulp-terser';
import webp from 'gulp-webp';
import scco from 'postcss-csso';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      scco()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(browser.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/scripts.js')
  .pipe(terser())
  .pipe(rename('scripts.min.js'))
  .pipe(gulp.dest('build/js'))
  .pipe(browser.stream())
}

exports.scripts = scripts;

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{svg,png,jpg}')
  .pipe(squoosh())
  .pipe(gulp.dest(build/img))
}

exports.images = optimizeImages;

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe('build/img')
}

exports.images = copyImages;

const createWebp = () => {
  return gulp.src('source/img/**/*/jpg')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest(build/img))
}

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
  .pipe(svgstore({inlineSvg: true}))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest(build/img))
}

exports.sprite = sprite;

// Copy

const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/img/**/*.svg',
    '!source/img/icons/*.svg'
   ],
  {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
}

exports.copy = copy;

// Clean

const clean = () => {
  return del('build')
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

exports.server = server;

// Reload

const reload = () => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js');
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  )
)

exports.build = build;

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
