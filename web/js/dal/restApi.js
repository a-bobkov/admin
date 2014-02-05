'use strict';

angular.module('app.dal.rest.api', ['app.dal.api'])

.factory('RestApi', function($q, Api) {

    /**
     *
     * @param string collectionName Имя коллекции сущностей, например: users, cities, markets
     * @param string entityName Имя сущности, например: user, city. market
     * @constructor
     */
    var RestApiConstructor = function (collectionName, entityName) {

        var url = '/' + collectionName + '/';

        this.getErrorHandler = function() {
            return function(response) {
                if (typeof response === 'string') {
                    return $q.reject(response);                     // пришла строка с ошибкой из api.responseHandler
                } else {
                    return $q.reject(response.data.error_code);     // пришел объект с ошибкой из api.errorHandler
                }
            };
        }


        this.getResponseHandler = function (sectionName, id) {
            return function(response) {
                var errorMessage,
                    data = response[sectionName];

                if (typeof data === 'undefined') {
                    errorMessage = 'Ответ сервера не содержит секции ' + sectionName;
                } else if (sectionName === collectionName && ({}.toString.call(data)) !== '[object Array]') {
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
        this.get = function(id) {
            return Api.get(url + id).then(
                this.getResponseHandler(entityName, id),
                this.getErrorHandler()
            );
        };

        /**
         * @param {Object} [params]
         * @param {Number} [params.page]
         * @param {Number} [params.limit]
         * @returns {Promise}
         */
        this.query = function(params) {
            return Api.get(url, params || {}).then(
                this.getResponseHandler(collectionName),
                this.getErrorHandler()
            );
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.create = function(data) {
            return Api.post(url, data).then(
                this.getResponseHandler(entityName),
                this.getErrorHandler()
            );
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.update = function(data) {
            return Api.put(url + data.id, data).then(
                this.getResponseHandler(entityName, data.id),
                this.getErrorHandler()
            );
        };

        /**
         * @param {Number} id
         * @returns {Promise}
         */
        this.remove = function(id) {
            return Api.remove(url + id).then(null, this.getErrorHandler());
        };
    };

    return RestApiConstructor;
});