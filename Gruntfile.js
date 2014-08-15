module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            admin: {
                files: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/admin.html.tmpl'],
                tasks: 'admin:dev'
            }
        },
        admin: {
            dev: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/css/*.css', 'web/js/mock/**/*.js'],
            prod: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/css/*.css']
        }
    });

    grunt.registerMultiTask('admin', 'Create admin.html', function() {
        var path = (this.target === 'dev') ? '' : '/fend/admin.html#/';
        var hash = (this.target === 'dev') ? '' : '?' + new Date().getTime();
        var app = (this.target === 'dev') ? 'RootApp-mocked' : 'RootApp';
        var scripts = '';
        var cssInclude = '';
        grunt.file.expand(this.data).forEach(function(file) {
            file = file.replace(/^web\//, '');
            if (file.match(/\.js$/)) {
                scripts += '\n    <script src="' + file + hash + '"></script>';
            } else if (file.match(/\.css$/)) {
                cssInclude += '\n    <link rel="stylesheet" href="' + file + hash + '">';
            }
        });
        grunt.file.write('web/admin.html', grunt.template.process(grunt.file.read('web/admin.html.tmpl'), {
            data: {
                path: path,
                cssInclude: cssInclude,
                scripts: scripts,
                hash: hash,
                app: app
            }
        }));
        console.log('File "admin.html" created.');
    });

    grunt.registerTask('dev', ['admin:dev']);
    grunt.registerTask('prod', ['admin:prod']);
    grunt.registerTask('default', ['admin:prod']);
};
