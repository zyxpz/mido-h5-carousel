const gulp = require('gulp');
const babel = require('gulp-babel');
const plugins = require('gulp-load-plugins')();
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');

gulp.task('clean', () => {
	return gulp.src('lib')
		.pipe(plugins.clean({
			force: true
		}))
});

// 编译js
gulp.task('js', () => {
	return gulp.src(['./src/index.js'])
		.pipe(babel())
		.on('error', (err) => {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(uglify())
		.on('error', (err) => {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('lib/'))
});

// 监听js修改
gulp.task('watch:js', () => {
	gulp.watch(['./src/index.js'], () => {
		gulp.run('js');
	});
});

gulp.task('default', () => {
	gulp.run('js');
	gulp.run('watch:js');
});

gulp.task('build', ['clean'], () => {
	gulp.run('default');
});