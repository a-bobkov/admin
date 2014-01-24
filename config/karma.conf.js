module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
        // библиотеки
    	'app/js/lib/angular/angular.js',
    	'app/js/lib/angular/angular-route.js',
        'app/js/lib/angular/angular-mocks.js',
        'app/js/lib/angular/i18n/angular-locale_ru-ru.js',
        'app/js/lib/lodash/lodash.min.js',

        // хелперы
        'test/lib/helpers.js',

        // функционал
        'app/js/dal/api.js'
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
