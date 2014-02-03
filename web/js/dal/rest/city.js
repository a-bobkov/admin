'use strict';

angular.module('app.dal.rest.city', ['app.dal.api'])

.factory('CityApi', function($q, Api) {
    var CityApi = {};

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
            } else if (sectionName === 'cities' && ({}.toString.call(data)) !== '[object Array]') {
                errorMessage = 'Ответ сервера не содержит массив в секции ' + sectionName;
            } else if (id && id !== data.id) {
                errorMessage = 'Ответ сервера не содержит данных требуемого элемента ' + id;
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
    CityApi.get = function(id) {
        var responseHandler = responseHandlerConstructor('city', id);
        return Api.get('/cities/' + id).then(responseHandler, errorHandler);
    };

    /**
     * @param {Object} [params]
     * @param {Number} [params.page]
     * @param {Number} [params.limit]
     * @returns {Promise}
     */
    CityApi.query = function(params) {
        var responseHandler = responseHandlerConstructor('cities');
        return Api.get('/cities/', params || {}).then(responseHandler, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    CityApi.create = function(data) {
        var responseHandler = responseHandlerConstructor('city');
        return Api.post('/cities/', data).then(responseHandler, errorHandler);
    };

    /**
     * @param {object} data
     * @returns {Promise}
     */
    CityApi.update = function(data) {
        var responseHandler = responseHandlerConstructor('city', data.id);
        return Api.put('/cities/' + data.id, data).then(responseHandler, errorHandler);
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    CityApi.remove = function(id) {
        return Api.remove('/cities/' + id).then(null, errorHandler);
    };

    return CityApi;
});