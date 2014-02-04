'use strict';

angular.module('app.dal.rest.manager', ['app.dal.rest.api'])

.factory('managerApi', function(RestApi) {
   return new RestApi('managers', 'manager');
});