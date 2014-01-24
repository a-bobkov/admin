module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
        // библиотеки
    	'web/js/lib/angular/angular.js',
    	'web/js/lib/angular/angular-route.js',
        'web/js/lib/angular/angular-mocks.js',
        'web/js/lib/angular/i18n/angular-locale_ru-ru.js',
        'web/js/lib/lodash/lodash.min.js',

        // хелперы
        'test/lib/helpers.js',

        // функционал
        'web/js/dal/api.js',

        // тесты
        'test/unit/**/*.js'
    ],

    exclude : [
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
