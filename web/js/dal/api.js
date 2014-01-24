'use strict';

angular.module('app.dal.api', [])

.provider('Api', function(){

    var options = this.options = {
        apiUrl: ''
    };

    this.$get = function($http, $q, $rootScope) {

        var Api = {};

        /**
         * Some common error handler
         *
         * @param response
         * @returns {Promise}
         */
        var errorHandler = function(response) {
            return $q.reject(response);
        };

        var responseHandler = function(response) {
            var data = response.data;
            if (   typeof data.status === 'undefined'
                || data.status !== 'success'
                || typeof data.data  === 'undefined'
            ) {
                return $q.reject(response);
            }

            return response.data;
        }

        Api.setErrorHandler = function(handler) {
            errorHandler = handler;
        }

        /**
         * Generic GET method call
         * @param name
         * @param {Object} [params]
         * @returns {Promise}
         */
        Api.get = function(name, params) {
            return $http({
                method: 'GET',
                url: options.apiUrl + name,
                params: params,
                withCredentials: true
            }).then(null, errorHandler);
        };

        /**
         * Generic POST method call
         * @param name
         * @param params
         * @returns {Promise}
         */
        Api.post = function(name, params) {
            return $http.post(options.apiUrl + name, params, {withCredentials: true}).then(null, errorHandler);
        };

        /**
         * Generic DELETE method call
         * @param name
         * @param params
         * @returns {Promise}
         */
        Api.remove = function(name, params) {
            return $http['delete'](options.apiUrl + name, {withCredentials: true, params: params}).then(null,errorHandler);
        };

        /**
         * Generic PUT method call
         * @param name
         * @param params
         * @returns HttpPromise
         */
        Api.put = function(name, params) {
            return $http.put(options.apiUrl+name, params, {withCredentials: true}).then(null,errorHandler);
        };

        return Api;
    };
});