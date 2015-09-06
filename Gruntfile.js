// Generated on 2014-11-29 using generator-jekyllrb 1.2.1
'use strict';

module.exports = function (grunt) {
	// Show elapsed time after tasks run
	require('time-grunt')(grunt);
	// Load all Grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		// Configurable paths
		yeoman: {
			app: 'app',
			dist: '.jekyll'
		},
		jekyll: {
			options: {
				bundleExec: true,
				config: '_config.yml,_config.build.yml',
				src: '<%= yeoman.app %>'
			},
			dist: {
				options: {
					dest: '<%= yeoman.dist %>',
				}
			}
		}
	});
};
