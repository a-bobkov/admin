'use strict';

angular.module('app.dal.rest.dealer', ['app.dal.rest.api'])

.factory('dealerApi', function(RestApi) {
   return new RestApi('dealers', 'dealer');
});