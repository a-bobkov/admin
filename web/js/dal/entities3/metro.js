'use strict';

angular.module('app.dal.entities.metro', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('metroApi', function(RestApi, Api) {
    var metroApi = new RestApi('metros', 'metro');
    return metroApi;
})

.factory('Metro', function() {

    var Metro = function(itemData, directories) {
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

    return Metro;
})

.factory('Metros', function() {
    var Metros = (function() {
        var Metros = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Metros;
    }());
    return Metros;
})

.factory('marketsLoader', function(Metro, Metros) {

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