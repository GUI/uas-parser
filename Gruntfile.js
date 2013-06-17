'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'index.js',
        'lib/**/*.js',
        'test/**/*.js',
      ],
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['test/**/*.js']
      },
    },
  });

  grunt.registerTask('updateData', function() {
    var done = this.async();

    var Updater = require('./lib/updater');

    var updateInterval = 1 * 24 * 60 * 60 * 1000; // 1 day
    new Updater(updateInterval, function(error) {
      done(error);
    });
  });

  grunt.registerTask('default', [
    'jshint',
    'updateData',
    'mochaTest',
  ]);
};
