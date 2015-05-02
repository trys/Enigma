var gulp = require( 'gulp' ),
	sass = require( 'gulp-sass' ),
	notify = require( 'gulp-notify' ),
	browserSync = require( 'browser-sync' ),
	reload = browserSync.reload;


gulp.task( 'sass',
	function () {
		return gulp.src( 'assets/scss/**/*.scss' )
		.pipe(
			sass(
				{
					//outputStyle: 'compressed',
					outputStyle: 'nested',
					precision: 10,
					onError: function ( err ) {
						notify().write( err );
					}
				}
			)
		)
		.pipe(
			gulp.dest( '' )
		)
		.pipe(
			reload(
				{
					stream: true
				}
			)
		);
	}
);

gulp.task( 'js',
	function () {
		return gulp.src( '*.js' )
		.pipe(
			gulp.dest( '' )
		)
		.pipe(
			reload(
				{
					stream: true
				}
			)
		);
	}
);


gulp.task( 'html',
	function () {
		return gulp.src( '*.html' )
		.pipe(
			gulp.dest( '' )
		)
		.pipe(
			reload(
				{
					stream: true
				}
			)
		);
	}
);



gulp.task( 'default',
	[ 'sass' ],
	function () {

		browserSync.init(
			{
				proxy: 'enigma.dev',
				notify: true,
				open: false
			}
		);

		gulp.watch(
			'assets/scss/**/*.scss',
			[ 'sass' ]
		);

		gulp.watch(
			'*.js',
			[ 'js' ]
		);

		gulp.watch(
			'*.html',
			[ 'html' ]
		);

	}
);


