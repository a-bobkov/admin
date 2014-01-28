'use strict';

angular.module('app.dal.rest.user', ['app.dal.api'])

/**
 * Too simple example with CRUD methods only.
 * More complex app can contain additional specific methods.
 * Also every method can have additional params handlers, etc.
 * Good place for API's documenting
 *
 * One common rule: "one endpoint - one method"
 */
.factory('UserApi', function($q, Api) {
    var UserApi = {};

    var errorHandler = function(response) {
        if (typeof response === 'string') {
            return $q.reject(response);                     // пришла строка с ошибкой из api.responseHandler
        } else {
            return $q.reject(response.data.error_code);     // пришел объект с ошибкой из api.errorHandler
        }
    };

    var responseHandlerConstructor = function (sectionName) {

        return function(response) {
            var errorMessage,
                data = response[sectionName];

            if (typeof data === 'undefined') {
                errorMessage = 'Ответ сервера не содержит секции ' + sectionName;
            }

            if (errorMessage) {
                return $q.reject(errorMessage);
            }

            return data;
        }
    };

    var responseHandlerUser = responseHandlerConstructor('user');

    var responseHandlerUsers = function (response) {
        var errorMessage,
            data = response['users'];

        var toClass = {}.toString;

        if (typeof data === 'undefined') {
            errorMessage = 'Ответ сервера не содержит секции users';
        } else if (toClass.call(data) !== '[object Array]') {
            errorMessage = 'Ответ сервера не содержит массив в секции users';
        }

        if (errorMessage) {
            return $q.reject(errorMessage);
        }

        return data;
    };

    UserApi.setErrorHandler = function(handler) {
        errorHandler = handler;
    }

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    UserApi.get = function(id) {
        return Api.get('/users/' + id).then(responseHandlerUser, errorHandler);
    };

    /**
     * @param {Object} [params]
     * @param {Number} [params.page]
     * @param {Number} [params.limit]
     * @returns {Promise}
     */
    UserApi.query = function(params) {
        return Api.get('/users/', params || {}).then(responseHandlerUsers, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    UserApi.create = function(data) {
        return Api.post('/users/', data).then(responseHandlerUser, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    UserApi.update = function(data) {
        return Api.put('/users/' + data.id, data).then(responseHandlerUser, errorHandler);
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    UserApi.remove = function(id) {
        return Api.remove('/users/' + id).then(null, errorHandler);
    };

    return UserApi;
});