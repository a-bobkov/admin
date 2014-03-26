'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi, Api) {
    var cityApi = new RestApi('cities', 'city');
    return cityApi;
})

.factory('City', function(Item) {

    var City = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(City.prototype, Item.prototype);
    return City;
})

.factory('Cities', function(Collection) {
    var Cities = (function() {
        var Cities = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Cities.prototype, Collection.prototype);
        return Cities;
    }());
    return Cities;
})

.service('citiesLoader', function(City, Cities) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new City(itemData, directories);
        });
        return new Cities(items, queryParams);
    };
});