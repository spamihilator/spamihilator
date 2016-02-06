var concat = require("gulp-concat");
var del = require("del");
var gulp = require("gulp");
var jasmine = require("gulp-jasmine");
var path = require("path");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var tslintconfig = require("./tslint.json");
var typedoc = require("gulp-typedoc");

var paths = {
  build: "build",
  fixtures: "test/**/fixtures/**/*",
  sources: "src/**/*.ts",
  tests: "test/**/*.js"
};

var tsProject = ts.createProject("tsconfig.json", {
  sortOutput: true,
  typescript: require("typescript")
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
 * Check code-style
 */
gulp.task("tslint", function() {
  return gulp.src(paths.sources)
    .pipe(tslint({
      configuration: tslintconfig
    }))
    .pipe(tslint.report("verbose"));
});

/**
 * Compile sources and execute tests
 */
gulp.task("test", ["compile"], function() {
  return gulp.src([paths.tests])
    .pipe(jasmine());
});

/**
 * Run tests and other tasks (such as linting)
 */
gulp.task("check", ["tslint", "test"]);

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
gulp.task("watch", ["check"], function() {
  return gulp.watch([paths.fixtures, paths.sources, paths.tests], ["check"]);
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
gulp.task("default", ["check"]);
