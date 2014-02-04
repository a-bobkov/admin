'use strict';

angular.module('app.dal.rest.group', ['app.dal.rest.api'])

.factory('groupApi', function(RestApi) {
   return new RestApi('groups', 'group');
});