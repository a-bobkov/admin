'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('marketApi', function(RestApi, Api) {
    var marketApi = new RestApi('markets', 'market');
    return marketApi;
})

.factory('Market', function() {

    var Market = function(itemData, directories) {
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value.id) {
                if (key === 'city') {
                    newValue = directories.cities.get(id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            // здесь можно реализовать дополнительную проверку и конвертацию данных элемента
            this[key] = newValue;
        });
    };

    return Market;
})

.factory('Markets', function() {
    var Markets = (function() {
        var Markets = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Markets;
    }());
    return Markets;
})

.factory('marketsLoader', function(Market, Markets) {

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