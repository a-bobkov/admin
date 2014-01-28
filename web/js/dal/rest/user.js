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

    var responseHandlerConstructor = function (sectionName, id) {

        return function(response) {
            var errorMessage,
                data = response[sectionName];

            if (typeof data === 'undefined') {
                errorMessage = 'Ответ сервера не содержит секции ' + sectionName;
            } else if (sectionName === 'users' && ({}.toString.call(data)) !== '[object Array]') {
                errorMessage = 'Ответ сервера не содержит массив в секции users';
            } else if (id && id !== data.id) {
                errorMessage = 'Ответ сервера не содержит данных требуемого пользователя ' + id;
            }

            if (errorMessage) {
                return $q.reject(errorMessage);
            }

            return data;
        }
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    UserApi.get = function(id) {
        var responseHandler = responseHandlerConstructor('user', id);
        return Api.get('/users/' + id).then(responseHandler, errorHandler);
    };

    /**
     * @param {Object} [params]
     * @param {Number} [params.page]
     * @param {Number} [params.limit]
     * @returns {Promise}
     */
    UserApi.query = function(params) {
        var responseHandler = responseHandlerConstructor('users');
        return Api.get('/users/', params || {}).then(responseHandler, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    UserApi.create = function(data) {
        var responseHandler = responseHandlerConstructor('user');
        return Api.post('/users/', data).then(responseHandler, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    UserApi.update = function(data) {
        var responseHandler = responseHandlerConstructor('user', data.id);
        return Api.put('/users/' + data.id, data).then(responseHandler, errorHandler);
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