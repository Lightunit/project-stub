'use strict';
/* common */
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const sequence = require('run-sequence');
const args = require('yargs').argv;
/* debugging */
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
/* server */
const server = require('browser-sync').create();
/* style */
const sass = require('gulp-sass');
const sassglob = require('gulp-sass-glob');
const csscomb = require('gulp-csscomb');
const csso = require('gulp-csso');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssSVG = require('postcss-svg');
/* html */
const jade = require('gulp-jade');
const formatter = require('gulp-jsbeautifier');
const htmlhint = require('gulp-htmlhint');
const posthtml = require('gulp-posthtml');
const attrSorter = require('posthtml-attrs-sorter');
/* js */
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
/* image */
const tiny = require('gulp-tinypng');

const handleError = (error) => {
    notify({
        title: 'Compile error!',
        message: '<%= error.message %>'
    }).write(error);
};

gulp.task('server', () => {
    server.init({
        open: false,
        logFileChanges: false,
        server: {
            baseDir: 'public/'
        }
    });
});

gulp.task('style', () => {
    const processors = [
        autoprefixer({
            browsers: ['last 2 versions']
        }),
        postcssSVG({
            paths: ['src/i/svg/'],
            svgo: true
        })
    ];

    return gulp.src('src/sass/index.sass')
        .pipe(gulpif(!args.production, sourcemaps.init()))
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(sassglob())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(csscomb('csscomb.json'))
        .pipe(gulpif(args.production, csso()))
        .pipe(rename({
            basename: 'bundle',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('public/css/'))
        .pipe(server.stream());
});

gulp.task('html', () => {
    return gulp.src('src/jade/*.jade')
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(jade())
        .pipe(gulp.dest('public/'));
});

gulp.task('formatter', ['html'], () => {
    const processors = [
        attrSorter({
            order: ['class', 'id', 'name', 'data-*', 'src', 'for', 'type', 'rel', 'media', 'href', 'value', 'title', 'alt', 'role', 'aria-*']
        })
    ];

    return gulp.src('public/*.html')
        .pipe(posthtml(processors))
        .pipe(formatter({
            indentSize: 4,
            unformatted: ['code', 'pre'],
            extra_liners: []
        }))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(gulp.dest('public/'))
        .pipe(server.stream());
});

gulp.task('js', () => {
    const source = args.vendor ? 'src/js/vendor/*.js' : ['src/js/core/*.js', 'src/js/*.js'];
    const basename = args.vendor ? 'vendor' : 'bundle';

    return gulp.src(source, { base: 'src/js/' })
        .pipe(gulpif(!args.production, sourcemaps.init()))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('bundle.js'))
        .pipe(gulpif(args.production, uglify()))
        .pipe(rename({
            basename: basename,
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('public/js/'))
        .pipe(server.stream());
});

gulp.task('image', () => {
    return gulp.src(['src/i/**/*.*', '!src/i/svg/*'], { base: 'src/i/' })
        .pipe(changed('public/i/'))
        .pipe(tiny('API_KEY'))
        .pipe(gulp.dest('public/i/'))
        .pipe(server.stream());
});

gulp.task('clean', () => {
    return gulp.src('public/', { read: false })
        .pipe(clean());
});

gulp.task('watch', () => {
    /* html watch */
    gulp.watch('src/jade/**/*.jade', ['formatter']);
    /* style watch */
    gulp.watch('src/sass/**/*.{scss,sass}', ['style']);
    /* js watch */
    gulp.watch('src/js/**/*.js', ['js']);
    /* image watch */
    gulp.watch(['src/i/**/*.*', '!src/i/svg/*'], ['image']);
});

gulp.task('build', () => {
    sequence('clean', ['formatter', 'image', 'style', 'js']);
});

gulp.task('default', ['server', 'watch']);