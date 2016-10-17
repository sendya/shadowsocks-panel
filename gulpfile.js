/*jslint node: true*/
"use strict";

var project = require('./package.json');
var gulp = require('gulp');
var watchify = require('watchify');
var browserify = require('browserify');
var postcss = require('gulp-postcss');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var del = require('del');
var eventStream = require('event-stream');
var gutil = require('gulp-util');
var gulpIf = require('gulp-if');

var needMangle = true;

var errorHandler = function (err) {
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>",
        sound: "Bottle"
    })(err);
    this.emit('end');
};

function handleJavaScriptBundle(bundle, filePath) {
    return bundle.on('error', errorHandler)
        .pipe(source(filePath))
        .pipe(gulpIf(needMangle, streamify(uglify({
            mangle: {
                toplevel: true,
                eval: true,
                screw_ie8: true,
                sort: true
            },
            mangleProperties: {
                regex: /^_/
            },
            compress: {
                drop_debugger: !needMangle,
                drop_console: !needMangle
            }
        }))))
        .pipe(gulp.dest('./Public/'));
}

gulp.task('browserify', function () {
    needMangle = true;
    var works = [];
    project.entries.js.forEach(function (filePath) {
        var task = browserify(filePath);
        task.transform('jstify');
        works.push(handleJavaScriptBundle(task.bundle(), filePath));
    });
    return eventStream.merge(works);
});

gulp.task('styles', function () {
    return gulp.src(project.entries.css, {base: './'})
        .on('error', errorHandler)
        .pipe(postcss([
            require('postcss-import'),
            require('autoprefixer')({browsers: ['ie >= 9', '> 2%', 'last 2 version']}),
            require('postcss-image-inliner')({maxFileSize: 8192}),
            require('cssnano')({discardComments: {removeAll: true}})
        ]))
        .pipe(gulp.dest('./Public/'));
});

gulp.task('clean', function () {
    return del([
        './Public/**',
        '!./Public',
        '!./Public/**/*.php'
    ]);
});

gulp.task('build', ['clean'], function () {
    gulp.start('styles', 'browserify');
});

gulp.task('watch', ['styles'], function () {
    needMangle = false;
    var works = [];
    gulp.watch('./Resource/**/*.css', ['styles']);
    project.entries.js.forEach(function (filePath) {
        var task = watchify(browserify({
            entries: [filePath],
            cache: {},
            packageCache: {}
        }));
        task.transform('jstify');
        task.on('update', function () {
            handleJavaScriptBundle(task.bundle(), filePath);
        });
        task.on('update', function (ids) {
            gutil.log('Updated: ' + ids);
        });
        works.push(handleJavaScriptBundle(task.bundle(), filePath));
    });
    return eventStream.merge(works);
});
