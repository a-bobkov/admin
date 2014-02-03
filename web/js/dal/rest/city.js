'use strict';

angular.module('app.dal.rest.city', ['app.dal.rest.api'])

.factory('cityApi', function(RestApi) {
   return new RestApi('cities', 'city');
});