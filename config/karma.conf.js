module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
//	'js/jquery.js',
//	'js/jquery-ui.custom.js',
//	'js/bootstrap.js',
//	'js/jquery.icheck.js',
//	'js/jquery.dataTables.js',
//	'js/jquery.jpanelmenu.js',
//	'js/jquery.nicescroll.js',
//	'js/unicorn.js',

	'app/js/lib/angular/angular.js',
	'app/js/lib/angular/angular-route.js',
    'app/js/lib/angular/angular-mocks.js',
//    'app/js/lib/angular/i18n/angular-locale_ru-ru.js',
    'test/lib/helpers.js',

    'app/js/lib/lodash/lodash.min.js',
    'app/js/dal/entities/user.js',
    'app/js/dal/fake/user.js',
    'app/js/dal/rest/user.js',
    'app/js/dal/api.js',

    'app/js/lib/ui-bootstrap/pagination-0.7.0.js',
    'app/js/lib/ui-bootstrap/modal-0.10.0.js',

	'app/js/page/user/controllers.js',
    'app/js/page/user/app.js',
    'app/js/page/user/app-mocked.js',

//	'test/mocks/*.js',
//	'test/unit/**/*.js'
    'test/unit/controllersSpec.js'
    ],

    exclude : [
	'ang/angular/angular-loader.js',
	'ang/angular/*.min.js',
	'ang/angular/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-script-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
        outputFile: 'test_out/unit.xml',
        suite: 'unit'
    }
  });
};
