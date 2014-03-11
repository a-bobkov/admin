'use strict';
angular.module('RootApp', ['UsersApp'])

.config(function(ApiProvider){  // $dialogProvider,
//    $dialogProvider.options({modalFade: true});
    ApiProvider.options.apiUrl = '/api2';
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