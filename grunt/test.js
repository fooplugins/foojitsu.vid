module.exports = function(grunt){
	var _ = require('lodash'),
		o = grunt.config('test') || {};

	o = _.extend({
		input: 'src/tests/',
		output: 'compiled/tests/',
		replace: [
			{ match: 'version', replacement: '<%= pkg.version %>' },
			{ match: 'name', replacement: '<%= pkg.name %>' },
			{ match: 'title', replacement: '<%= pkg.title %>' },
			{ match: 'description', replacement: '<%= pkg.description %>' },
			{ match: 'youtube', replacement: 'AIzaSyBMT07ftYs1dGnguTdI8I_fXazRyrnZcEA' }
		]
	}, o);

	grunt.config.merge({
		replace: {
			test: {
				options: {
					patterns: o.replace.slice().concat([
						{ match: 'file', replacement: '../<%= pkg.name %>.js' }
					])
				},
				files: [{ expand: true, flatten: true, src: [o.input+'*.html'], dest: o.output }]
			},
			test_min: {
				options: {
					patterns: o.replace.slice().concat([
						{ match: 'file', replacement: '../<%= pkg.name %>.min.js' }
					])
				},
				files: [{
					expand: true, flatten: true, src: [o.input+'*.html'], dest: o.output,
					rename: function(dest, src){
						return dest + src.replace(/(\.html|\.htm)$/, '.min$1');
					}
				}]
			}
		},
		copy: {
			test: {
				files: [{
					expand: true,
					cwd: o.input+'content/',
					src: ['*.*'],
					dest: o.output+'content/'
				}]
			}
		},
		qunit: {
			options : {
				'--web-security': false,
				'--local-to-remote-url-access': true
			},
			test: [o.output+'*.html']
		}
	});

	grunt.registerTask('build-tests', ['build', 'replace:test', 'replace:test_min', 'copy:test']);
	grunt.registerTask('test', ['build-tests', 'qunit:test']);
};