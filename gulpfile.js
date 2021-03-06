const gulp = require("gulp");
const ts = require("gulp-typescript");
const JSON_FILES = ["src/*.json", "src/**/*.json"];

// pull in the project TypeScript config
const tsProject = ts.createProject("tsconfig.json");

const scripts = () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest("dist"));
};

const watchSrc = () => {
    gulp.watch("src/**/*.ts", scripts);
};

const assets = () => {
    return gulp.src(JSON_FILES).pipe(gulp.dest("dist"));
};

const defaultTasks = gulp.series(watchSrc, assets);

exports.scripts = scripts;
exports.watch = watchSrc;
exports.assets = assets;
exports.default = defaultTasks;
