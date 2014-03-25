'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('marketApi', function(RestApi, Api) {
    var marketApi = new RestApi('markets', 'market');
    return marketApi;
})

.factory('Market', function() {
    var Market = function(itemData) {
        angular.extend(this, itemData);
    };
    return Market;
})

.factory('Markets', function(Market) {
var Markets = (function() {
    var Markets = inheritCollection(function(itemsData, queryParams) {
        Collection.prototype.construct(itemsData, queryParams, Market);
    });
    return Markets;
}());
return Markets;
})

.factory('marketsLoader', function(Markets) {

    this.makeItem = function(directories) {
        if (typeof this.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(this));
        }
        return _.mapValues(this, function(value, key) {
            var newItem = value;
            if (value.id) {    // ссылка
                if (key === 'city') {
                    newItem = directories.cities.get(id);
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
    });

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem, directories);
        return new Markets(newItemsData, queryParams);
    };
});