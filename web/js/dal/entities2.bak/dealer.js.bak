'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi, Api) {
    var dealerApi = new RestApi('dealers', 'dealer');
    return dealerApi;
})

.factory('Dealer', function() {
    var Dealer = function(itemData) {
        angular.extend(this, itemData);
    };
    return Dealer;
})

.factory('Dealers', function(Dealer) {
var Dealers = (function() {
    var Dealers = inheritCollection(function(itemsData, queryParams) {
        Collection.prototype.construct(itemsData, queryParams, Dealer);
    });
    return Dealers;
}());
return Dealers;
})

.factory('dealersLoader', function(Dealers) {

    this.makeItem = function(directories) {
        if (typeof this.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(this));
        }
        return _.mapValues(this, function(value, key) {
            var newItem = value;
            if (value.id) {    // ссылка
                if (key === 'manager') {
                    newItem = directories.managers.get(id);
                } else if (key === 'city') {
                    newItem = directories.cities.get(id);
                } else if (key === 'market') {
                    newItem = directories.markets.get(id);
                } else if (key === 'metro') {
                    newItem = directories.metros.get(id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newItem) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                // здесь можно реализовать дополнительную проверку и конвертацию данных айтема
            }
            return newItem;
        });
    };

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem, directories);
        return new Dealers(newItemsData, queryParams);
    };
});