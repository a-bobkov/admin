'use strict';

angular.module('app.dal.rest.user', ['app.dal.rest.api'])

.factory('userApi', function(RestApi) {
    return new RestApi('users', 'user');
});