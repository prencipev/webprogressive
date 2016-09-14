var gulp = require('gulp');
var path = require('path');
var swPrecache = require('sw-precache');
var rootDir = 'public';

gulp.task('generate-service-worker', function (callback) {
    swPrecache.write(path.join(rootDir, 'service-worker.js'), {
        staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
        stripPrefix: rootDir
    }, callback);
});/* eslint-env node */