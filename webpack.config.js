'use strict';

const path = require('path');

module.exports = {
	module: {
		loaders: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015'],
					plugins: ['transform-runtime']
				}
			}
		]
	},
	entry: [
		'./js/index.js'	
	],
    output: {
        library: 'ASlides',
        libraryTarget: 'umd',
        path: path.join(__dirname, 'build'),
		filename: 'a-slides.js'
    }
};
