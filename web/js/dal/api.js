'use strict';

angular.module('app.dal.api', [])

.provider('Api', function(){

    var options = this.options = {
        apiUrl: ''
    };

    this.$get = function($http, $q, $log) {

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
            var errorMessage,
                data = response.data;

            if (typeof data.status === 'undefined') {
                errorMessage = 'Ответ сервера не соответствует формату JSend';
            } else if (-1 === ['success', 'error'].indexOf(data.status)) {
                errorMessage = 'Сервер возвратил некорректный статус ответа: ' + data.status;
            } else if (data.status === 'error') {
                errorMessage = 'Сервер возвратил ошибку: ' + data.message;
            } else if (typeof data.data === 'undefined') {
                errorMessage = 'Ответ сервера не содержит данных';
            }

            if (errorMessage) {
                $log.error(errorMessage);
                return $q.reject({response: response, errorMessage: errorMessage});
            }

            return response.data.data;
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
            }).then(responseHandler, errorHandler);
        };

        /**
         * Generic POST method call
         * @param name
         * @param params
         * @returns {Promise}
         */
        Api.post = function(name, data) {
            return $http({
                method: 'POST',
                url: options.apiUrl + name,
                data: data,
                withCredentials: true
            }).then(responseHandler, errorHandler);
        };

        /**
         * Generic PUT method call
         * @param name
         * @param params
         * @returns HttpPromise
         */
        Api.put = function(name, data) {
            return $http({
                method: 'PUT',
                url: options.apiUrl + name,
                data: data,
                withCredentials: true
            }).then(responseHandler, errorHandler);
        };

        /**
         * Generic DELETE method call
         * @param name
         * @param params
         * @returns {Promise}
         */
        Api.remove = function(name, params) {
            return $http({
                method: 'DELETE',
                url: options.apiUrl + name,
                params: params,
                withCredentials: true
            }).then(responseHandler, errorHandler);
        };

        return Api;
    };
});