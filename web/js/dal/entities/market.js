'use strict';

angular.module('max.dal.entities.market', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('marketApi', function(RestApi, Api) {
    var marketApi = new RestApi('markets', 'market');
    return marketApi;
})

.factory('Market', function(Item) {

    var Market = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {
                if (key === 'city') {
                    newValue = directories.cities.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };
    _.extend(Market.prototype, Item.prototype);
    return Market;
})

.factory('Markets', function(Collection) {
    var Markets = (function() {
        var Markets = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Markets.prototype, Collection.prototype);
        return Markets;
    }());
    return Markets;
})

.service('marketsLoader', function(Market, Markets) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Market(itemData, directories);
        });
        return new Markets(items, queryParams);
    };
});