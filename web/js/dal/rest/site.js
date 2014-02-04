'use strict';

angular.module('app.dal.rest.site', ['app.dal.rest.api'])

.factory('siteApi', function(RestApi) {
   return new RestApi('sites', 'site');
});