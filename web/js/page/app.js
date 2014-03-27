'use strict';
angular.module('RootApp', ['UsersApp'])

.config(function(ApiProvider){  // $dialogProvider,
//    $dialogProvider.options({modalFade: true});
    ApiProvider.options.apiUrl = '/api2';
})

// from https://groups.google.com/d/msg/angular/DWOMe6c7L_Q/DO3xaO0z8PEJ
.config(function($provide) {
	$provide.decorator('$log', function($delegate) {
		// decorate all the common logging methods
		['log', 'debug', 'info', 'warn', 'error'].forEach(function(o) {
			$delegate[o] = decoratedLogger($delegate[o]);
			$delegate[o].logs = []; // this keeps angular-mocks happy
		});
		return $delegate;

		function logGoogleAnalytics(errorObj) {
			_gaq.push([
				'_trackEvent',
				errorObj.message, 
				errorObj.stack,
				'',
				0, true
			]);
		}

        function decoratedLogger(originalFn) {
            return function() {
            	var errors = arguments[0];
            	if (angular.isArray(errors)) {
            		angular.forEach(errors, logGoogleAnalytics)
            	} else {
            		logGoogleAnalytics(errors);
            	}
            	originalFn.apply(this, arguments);
            };
        }
    });
})

.factory('$exceptionHandler', function ($log) {
    return function (exception, cause) {
    	$log.error(exception);
	    document.getElementById('content_frame').style.display = 'none';
	    document.getElementById('javascriptErrorMessage').innerHTML = exception.message;
	    document.getElementById('javascriptErrorStack').innerHTML = exception.stack.replace( /\n/g ,'<br>');
	    document.getElementById('javascriptError').style.display = 'block';
    };
})

.controller('AppCtrl', function($scope) {

	$scope.viewRouteSpinner = false;

	$scope.$on('$routeChangeStart', function() {
	  $scope.viewRouteSpinner = true;
	});

	$scope.$on('$routeChangeSuccess', function() {
	  $scope.viewRouteSpinner = false;
	});

	$scope.$on('$routeChangeError', function() {
	  $scope.viewRouteSpinner = false;
	});

});