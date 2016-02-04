var concat = require("gulp-concat");
var del = require("del");
var gulp = require("gulp");
var jasmine = require("gulp-jasmine");
var path = require("path");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");
var typedoc = require("gulp-typedoc");

var paths = {
  build: "build",
  sources: "src/**/*.ts",
  tests: "test/**/*.js"
};

var tsProject = ts.createProject("tsconfig.json", {
  sortOutput: true
});

/**
 * Compile sources and write to build directory
 */
gulp.task("compile", function() {
  /*var r = gulp.src(paths.sources)
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject));
  return r.js
    .pipe(concat("index.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.build));*/
  return gulp.src(paths.sources)
    .pipe(ts(tsProject))
    .pipe(gulp.dest(paths.build));
});

/**
 * Compile sources and execute tests
 */
gulp.task("test", ["compile"], function() {
  return gulp.src([paths.tests])
    .pipe(jasmine());
});

/**
 * Generate typedoc documentation
 */
gulp.task("typedoc", function() {
  return gulp.src([paths.sources])
    .pipe(typedoc({
      module: "commonjs",
      target: "es6",
      out: path.join(paths.build, "docs"),
      name: "Spamihilator"
    }));
});

/**
 * Keep compiling sources and continuously run tests
 */
gulp.task("watch", ["test"], function() {
  return gulp.watch([paths.sources, paths.tests], ["test"]);
});

/**
 * Clean output files
 */
gulp.task("clean", function(cb) {
  del([paths.build], cb);
});

/**
 * Default task
 */
gulp.task("default", ["test"]);
