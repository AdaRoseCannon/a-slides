// generated on 2015-07-01 using generator-gulp-webapp 1.0.2
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {mkdirSync, statSync, readdirSync, createWriteStream} from 'fs';
import browserify from 'browserify';
import babelify from 'babelify';
import exit from 'gulp-exit';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
	return gulp.src('app/_styles/*.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({browsers: ['last 1 version']}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({stream: true}));
});

gulp.task('jekyll', () => {

	// Allow the requiring of grunt jekyll
	require('gulp-grunt')(gulp);
	gulp.start('grunt-jekyll');

	return new Promise(r => {
		gulp.on('task_stop', function(e) {
			if (e.task === 'grunt-jekyll') r(exit());
		});
	});
});

gulp.task('browserify', function () {
	try {
		mkdirSync('.tmp');
	} catch (e) {
		if (e.code !== 'EEXIST') {
			throw e;
		}
	}

	try {
		mkdirSync('.tmp/scripts');
	} catch (e) {
		if (e.code !== 'EEXIST') {
			throw e;
		}
	}

	return Promise.all(readdirSync('./app/_scripts/').map(function (a) {
		var path = './app/_scripts/' + a;
		if (!statSync(path).isDirectory()) {
			return new Promise(function (resolve, reject) {
				process.stdout.write('Browserify: Processing ' + a + '\n');
								var writer = createWriteStream('.tmp/scripts/' + a);
								writer.on('finish', function () {
									resolve(a);
								});
				browserify({ debug: true })
					.transform(babelify)
					.require(require.resolve(path), { entry: true })
					.bundle()
					.on('error', function(err) {
						this.emit('exit');
						reject(err);
					})
					.pipe(writer);
			}).then(function (a) {
				process.stdout.write('Browserify: Finished processing ' + a + '\n');
			});
		} else {
			return undefined;
		}
	})).then(function () {
		process.stdout.write('Browserify: Finished all\n');
	}, function (e) {
		process.stdout.write(e);
	});
});

function lint(files, options) {
	return () => {
		return gulp.src(files)
			.pipe(reload({stream: true, once: true}))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}

const testLintOptions = {
	env: {
		mocha: true
	},
	globals: {
		assert: false,
		expect: false,
		should: false
	}
};

gulp.task('lint', lint('app/_scripts/**/*.js', {
	env: {
		"es6": true,
		"node": true
	},
	rules: require('./.eslintrc.json')
}));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], () => {
	const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

	return gulp.src('dist/**/*.html')
		.pipe(assets)
		.pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
		.pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
	return gulp.src('app/images/**/*')
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{cleanupIDs: false}]
		}))
		.on('error', function (err) {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('.tmp/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy-scripts', ['browserify'], () => {
	return gulp.src([
		'.tmp/**/*.js', // everything which has been browserified
		'app/*.js' // service worker
	])
	.pipe($.uglify())
	.pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['jekyll', 'styles', 'browserify', 'fonts'], () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist', '.tmp', 'app'],
			routes: {}
		}
	});

	gulp.watch([
		'dist/**/*.html',
		'app/images/**/*',
		'.tmp/fonts/**/*'
	]).on('change', reload);


	gulp.watch('app/**/*.{md,html}', ['jekyll']);
	gulp.watch('app/_styles/**/*.scss', ['styles']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('app/_scripts/**/*.js', ['browserify']);
});

gulp.task('serve:dist', () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', () => {
	browserSync({
		notify: false,
		port: 9000,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {}
		}
	});

	gulp.watch('test/spec/**/*.js').on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('ship', function () {
	return gulp.src('./dist/**/*')
		.pipe(require('gulp-gh-pages')({
			origin: 'ssh://ada@ssh.1am.club/~/ada.is/.git',
			remoteUrl: 'ssh://ada@ssh.1am.club/~/ada.is/.git',
			branch: 'master'
		}));
});

gulp.task('deploy', ['build'], function () {
	return gulp.start('ship');
});

gulp.task('build-post', ['copy-scripts', 'html', 'images', 'fonts'], () => {
	return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true})).pipe(exit());
});

gulp.task('build', ['jekyll'], () => {
	gulp.start('build-post');
});

gulp.task('default', ['clean'], () => {
	gulp.start('build');
});
