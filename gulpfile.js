var gulp = require( 'gulp' ),
	sass = require( 'gulp-sass' ),
	notify = require( 'gulp-notify' ),
	browserSync = require( 'browser-sync' ),
	reload = browserSync.reload,
	postCSS = {
		nano: require( 'cssnano' ),
		core: require( 'gulp-postcss' ),
		media: require( 'css-mqpacker' ),
		prefix: require( 'autoprefixer' )
	};


gulp.task( 'sass',
	function () {
		return gulp.src( 'assets/scss/**/*.scss' )
		.pipe(
			sass(
				{
					outputStyle: 'compressed',
					precision: 10,
				}
			)
			.on( 'error', onError )
		)
		.pipe(
			postCSS.core(
				[
					postCSS.prefix(
						{
							browsers: [
								'ie >= 9',
								'ie_mob >= 10',
								'ff >= 30',
								'chrome >= 34',
								'safari >= 7',
								'opera >= 23',
								'ios >= 7',
								'android >= 4.4',
								'bb >= 10'
							],
							cascade : false,
							remove  : true
						}
					),
					postCSS.media(
						{
							sort: true
						}
					)
				]
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


function onError( err ) {
	notify().write( err );
	this.emit( 'end' );
}


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


