'use strict';

angular.module('max.dal.entities.metro', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('metroApi', function(RestApi, Api) {
    var metroApi = new RestApi('metros', 'metro');
    return metroApi;
})

.factory('Metro', function(Item) {

    var Metro = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value.id) {
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
            // здесь можно реализовать дополнительную проверку и конвертацию данных элемента
            self[key] = newValue;
        });
    };
    _.extend(Metro.prototype, Item.prototype);
    return Metro;
})

.factory('Metros', function(Collection) {
    var Metros = (function() {
        var Metros = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Metros.prototype, Collection.prototype);
        return Metros;
    }());
    return Metros;
})

.service('metrosLoader', function(Metro, Metros) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Metro(itemData, directories);
        });
        return new Metros(items, queryParams);
    };
});