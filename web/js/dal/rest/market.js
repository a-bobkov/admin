'use strict';

angular.module('app.dal.rest.market', ['app.dal.rest.api'])

.factory('marketApi', function(RestApi) {
   return new RestApi('markets', 'market');
});