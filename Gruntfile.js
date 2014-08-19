module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            html2js: {
                files: 'web/template/**/*.html',
                tasks: 'html2js:template'
            },
            admin: {
                files: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/admin.html.tmpl'],
                tasks: 'admin:dev'
            }
        },
        html2js: {
            template: [ 'web/template/**/*.html' ]
        },
        admin: {
            dev: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/css/*.css', 'web/js/mock/**/*.js'],
            prod: ['web/js/dal/**/*.js', 'web/js/page/**/*.js', 'web/js/lib/**/*.js', 'web/css/*.css', 'web/template/**/*.js']
        }
    });

    grunt.registerMultiTask('html2js', 'Generate js version of html templates', function() {

        function escapeContent(content) {
            return content.replace(/"/g, '\\"').replace(/\r?\n/g, '" +\n    "');
        };

        var template = 'angular.module("<%=file%>", []).run(function($templateCache) {\n'
                     + '  $templateCache.put("<%=file%>",\n    "<%=content%>");\n'
                     + '});\n';

        var files = grunt._watch_changed_files || grunt.file.expand(this.data);

        files.forEach(function(file) {
            grunt.file.write(file + '.js', grunt.template.process(template, {
                data: {
                    file: file.replace(/^web\//,''),
                    content: escapeContent(grunt.file.read(file))
                }
            }));
        });
        console.log('Files JS from templates created.');
    });

    grunt.registerMultiTask('admin', 'Create admin.html', function() {
        function fileHash(file, target) {
            return (target === 'dev') ? '' : '?' + require('crypto').createHash('md5').update(grunt.file.read(file)).digest('hex').slice(0, 8);
        }
        var base = (this.target === 'dev') ? '' : '/fend/admin.html#/';
        var path = (this.target === 'dev') ? '' : '/';
        var app = (this.target === 'dev') ? 'RootApp-mocked' : 'RootApp';
        var scripts = '';
        var cssInclude = '';
        var that = this;
        grunt.file.expand(this.data).forEach(function(file) {
            var hash = fileHash(file, that.target);
            file = file.replace(/^web\//, '');
            if (file.match(/\.js$/)) {
                scripts += '\n    <script src="' + file + hash + '"></script>';
            } else if (file.match(/\.css$/)) {
                cssInclude += '\n    <link rel="stylesheet" href="' + file + hash + '">';
            }
        });
        grunt.file.write('web/admin.html', grunt.template.process(grunt.file.read('web/admin.html.tmpl'), {
            data: {
                base: base,
                path: path,
                cssInclude: cssInclude,
                scripts: scripts,
                hashFavicon: fileHash('web/favicon.ico', this.target),
                hashScreen: fileHash('web/css/blueprint/screen.css', this.target),
                hashPrint: fileHash('web/css/blueprint/print.css', this.target),
                hashIE: fileHash('web/css/blueprint/ie.css', this.target),
                hashShim: fileHash('web/js/vendor/es5-shim/es5-shim.min.js', this.target),
                hashGA: fileHash('web/js/page/setupga.js', this.target),
                hashLogo: fileHash('web/images/logo.png', this.target),
                app: app
            }
        }));
        console.log('File "admin.html" created.');
    });

    grunt.registerTask('dev', ['admin:dev']);
    grunt.registerTask('prod', ['html2js:template', 'admin:prod']);
    grunt.registerTask('default', ['html2js:template', 'admin:prod']);
};
