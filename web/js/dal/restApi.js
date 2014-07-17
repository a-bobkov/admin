'use strict';

angular.module('max.dal.rest.api', ['max.dal.api'])

.factory('RestApi', function($q, Api, $log) {

    /**
     *
     * @param string collectionName Имя коллекции сущностей, например: users, cities, markets
     * @param string entityName Имя сущности, например: user, city. market
     * @constructor
     */
    var RestApiConstructor = function (collectionName, entityName, apiPrefix) {

        var url = '/' + ((apiPrefix) ? apiPrefix + '/' : '') + collectionName.toLowerCase();

        this._getResponseHandler = function (sectionName, id) {
            return function(response) {
                var errorMessage,
                    data = response[sectionName];

                if (typeof data === 'undefined') {
                    errorMessage = 'Ответ сервера не содержит секции ' + sectionName;
                } else if (sectionName === collectionName && !angular.isArray(data)) {
                    errorMessage = 'Ответ сервера не содержит массив в секции ' + sectionName;
                } else if (id && id.toString() !== data.id.toString()) {
                    errorMessage = 'Ответ сервера не содержит данных требуемого элемента ' + id;
                }   // todo: проверить, что в ответе на запрос query всегда есть секция params (+юнит-тест)

                if (errorMessage) {
                    throw _.assign(new Error(errorMessage), {response: response});
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
            if (_.contains(['sales', 'tariffs', 'tariffrates', 'sites'], url.replace(/\/(\w+)$/, '$1'))) {
                var paramsPager = _.assign({}, params.pager);
                var paramsFiltersOrdersFields = _.pick(params, ['filters', 'fields', 'orders']);
                if (!_.isEmpty(paramsFiltersOrdersFields)) {
                    return Api.post(url, paramsFiltersOrdersFields, paramsPager).then(
                        this._getResponseHandler(collectionName)
                    );
                } else {
                    return Api.get(url, paramsPager).then(
                        this._getResponseHandler(collectionName)
                    );
                }
            }
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
            var entityData = {};    // todo: проверить, что в запросе всегда есть секция user (+юнит-тест)
            entityData[entityName] = data;
            return Api.post(url + '/new', entityData).then(
                this._getResponseHandler(entityName)
            );
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.update = function(data) {
            var entityData = {};
            entityData[entityName] = data;
            return Api.put(url + '/' + data.id, entityData).then(
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