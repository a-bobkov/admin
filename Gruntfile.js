module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            admin: {
                files: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/admin.html.tmpl'],
                tasks: 'admin:dev'
            }
        },
        admin: {
            dev: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/js/mock/**/*.js'],
            prod: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js']
        }
    });

    grunt.registerMultiTask('admin', 'Create admin.html', function() {
        var files = grunt.file.expand(this.data);
        var now = new Date().getTime();
        var scriptsStr = '';
        var that = this;
        files.forEach(function(file) {
            file = file.replace(/^web\//, '');
            if (that.target === 'dev') {
                scriptsStr += '    <script src="' + file + '"></script>\n';
            } else if (that.target === 'prod') {
                scriptsStr += '    <script src="' + file + '?bust=' + now + '"></script>\n';
            }
        });
        grunt.file.write('web/admin.html', grunt.template.process(grunt.file.read('web/admin.html.tmpl'), {
            data: {
                scripts: scriptsStr
            }
        }));
        console.log('File "admin.html" created.');
    });

    grunt.registerTask('dev', ['admin:dev']);
    grunt.registerTask('prod', ['admin:prod']);
    grunt.registerTask('default', ['admin:prod']);
};
