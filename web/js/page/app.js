'use strict';
angular.module('RootApp', ['UsersApp'])

.config(function(ApiProvider){  // $dialogProvider,
//    $dialogProvider.options({modalFade: true});
    ApiProvider.options.apiUrl = '/api2';
});