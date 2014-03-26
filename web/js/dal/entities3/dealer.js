'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi, Api) {
    var dealerApi = new RestApi('dealers', 'dealer');
    return dealerApi;
})

.factory('Dealer', function() {

    var Dealer = function(itemData, directories) {
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value.id) {
                if (key === 'manager') {
                    newValue = directories.managers.get(id);
                } else if (key === 'city') {
                    newValue = directories.cities.get(id);
                } else if (key === 'market') {
                    newValue = directories.markets.get(id);
                } else if (key === 'metro') {
                    newValue = directories.metros.get(id);
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

    return Dealer;
})

.factory('Dealers', function() {
    var Dealers = (function() {
        var Dealers = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Dealers;
    }());
    return Dealers;
})

.factory('dealersLoader', function(Dealer, Dealers) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Dealer(itemData, directories);
        });
        return new Dealers(items, queryParams);
    };
});