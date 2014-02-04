'use strict';

angular.module('app.dal.rest.metro', ['app.dal.rest.api'])

.factory('metroApi', function(RestApi) {
   return new RestApi('metros', 'metro');
});