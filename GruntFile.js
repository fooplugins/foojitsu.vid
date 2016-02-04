'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		build: {
			js: [
				'src/js/vid.js',
				'src/js/providers/*.js'
			]
		}
	});

	// Load grunt tasks
	require('load-grunt-tasks')(grunt);
	grunt.loadTasks('grunt');

	grunt.registerTask('default', ['build']);
};