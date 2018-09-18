module.exports = function (grunt) {
	grunt.initConfig({
		sass: {
			options: {
				sourceMap: true,
			},
			dist: {
				files: {
					'css/main.css': 'scss/main.scss',
				},
			},
		},
		watch: {
			scripts: {
				files: ['scss/*.scss'],
				tasks: ['sass'],
				options: {
					spawn: false,
				},
			},
			configFiles: {
				files: ['Gruntfile.js'],
			},
		},
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['sass']);
	grunt.registerTask('dev', ['sass', 'watch']);
}
