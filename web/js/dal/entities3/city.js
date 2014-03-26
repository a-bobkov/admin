'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi, Api) {
    var cityApi = new RestApi('cities', 'city');
    return cityApi;
})

.factory('City', function() {

    var City = function(itemData, directories) {
        _.extend(this, itemData);
    };
    return City;
})

.factory('Cities', function() {

    var Cities = (function() {
        var Cities = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Cities;
    }());
    return Cities;
})

.factory('citiesLoader', function(City, Cities) {

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