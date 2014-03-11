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
			if (errorObj instanceof CollectionError) {
				_gaq.push([
					'_trackEvent',
					'CollectionError', 
					errorObj.message, 
					errorObj.stack,
					0, true
				]);
			}
		}

        function decoratedLogger(originalFn) {
            return function() {
            	var errors = arguments[0];
	            console.log(errors);
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