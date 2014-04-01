'use strict';

angular.module('max.dal.rest.api', ['max.dal.api'])

.factory('RestApi', function($q, Api, $log) {

    /**
     *
     * @param string collectionName Имя коллекции сущностей, например: users, cities, markets
     * @param string entityName Имя сущности, например: user, city. market
     * @constructor
     */
    var RestApiConstructor = function (collectionName, entityName) {

        var url = '/' + collectionName;

        this._getResponseHandler = function (sectionName, id) {
            return function(response) {
                var errorMessage,
                    data = response[sectionName];

                if (typeof data === 'undefined') {
                    errorMessage = 'Ответ сервера не содержит секции ' + sectionName;
                } else if (sectionName === collectionName && !angular.isArray(data)) {
                    errorMessage = 'Ответ сервера не содержит массив в секции ' + sectionName;
                } else if (id && id !== data.id) {
                    errorMessage = 'Ответ сервера не содержит данных требуемого элемента ' + id;
                }   // todo: проверить, что в ответе на запрос query всегда есть секция params (+юнит-тест)

                if (errorMessage) {
                    $log.error(errorMessage);
                    return $q.reject({response: response, errorMessage: errorMessage});
                }

                return response;
            }
        };

        /**
         * @param {Number} id
         * @returns {Promise}
         */
        this.get = function(id) {
            return Api.get(url + '/' + id).then(
                this._getResponseHandler(entityName, id)
            );
        };

        /**
         * @param {Object} [params]
         * @param {Number} [params.page]
         * @param {Number} [params.limit]
         * @returns {Promise}
         */
        this.query = function(params) {
            if (params) {
                var paramsOrderPager =  _.assign({}, params.order, params.pager);
            }
            var paramsFiltersFields = _.pick(params, ['filters', 'fields']);
            if (!_.isEmpty(paramsFiltersFields)) {
                return Api.post(url, paramsFiltersFields, paramsOrderPager).then(
                    this._getResponseHandler(collectionName)
                );
            } else {
                return Api.get(url, paramsOrderPager).then(
                    this._getResponseHandler(collectionName)
                );
            }
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.create = function(data) {
            return Api.post(url + '/new', data).then(
                this._getResponseHandler(entityName)
            );
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.update = function(data) {
            return Api.put(url + '/' + data.id, data).then(
                this._getResponseHandler(entityName, data.id)
            );
        };

        /**
         * @param {Number} id
         * @returns {Promise}
         */
        this.remove = function(id) {
            return Api.remove(url + '/' + id);
        };
    };

    return RestApiConstructor;
});