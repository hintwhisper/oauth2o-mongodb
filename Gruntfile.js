
/**
 * I'm adding this comment just to test deployment
 */

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  // project configuration
  
  grunt.initConfig({ pkg: pkg });

  grunt.registerTask('runNode', function () {
    grunt.util.spawn({
      cmd: 'node',
      args: ['./node_modules/nodemon/bin/nodemon.js', 'standalone.js'],
      opts: {
        stdio: 'inherit'
      }
    }, function () {
      grunt.fail.fatal(new Error('nodemon quit'));
    });
  });

  grunt.registerTask('server', [ 'runNode' ]);

};
