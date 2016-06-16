//gruntfile.js
module.exports = function( grunt ) {
    grunt.initConfig( {
        nodemon: {
            all: {
                script: 'app.js',
                options: {
                    watchedExtensions: [ 'js', 'json' ]
                }
            }
        }

    } );

    grunt.loadNpmTasks( 'grunt-nodemon' );
    grunt.registerTask( 'default', [ 'nodemon' ] );

};