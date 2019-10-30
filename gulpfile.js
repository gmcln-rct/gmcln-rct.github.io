"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();

// this function will transpile our SCSS into CSS and
// stream any changes to the browser
function style() {
    return (
        gulp
            // 1. indicate the origin SCSS files
            .src("./assets/sass/**/*.scss")
            // 2. invoke the transpiling and log any errors to the console
            .pipe(sass().on("error", sass.logError))
            // 3. indicate the destination directory
            .pipe(gulp.dest("./assets/css"))
            // 4. stream any changes to the browser
            .pipe(browserSync.stream())
    );
}

// this function will initialize our dev browser and watch files for changes
// to trigger live reloads
function watch() {
    browserSync.init({
        server: {
            // indicate the root to be hosted on our dev server
            baseDir: "./"
        }
    });
    // each of these watch callbacks will take a location to watch
    // as a first argument and a callback to invoke when a change occurs
    gulp.watch("./assets/sass/**/*.scss", style);
    gulp.watch("./*.html").on("change", browserSync.reload);
    gulp.watch("./assets/js/**/*.js").on("change", browserSync.reload);
}

// here we export the gulp commands for access in our terminal
exports.style = style;
exports.watch = watch;