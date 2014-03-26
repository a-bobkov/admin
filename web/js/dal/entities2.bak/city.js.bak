'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi, Api) {
    var cityApi = new RestApi('cities', 'city');
    return cityApi;
})

.factory('City', function() {
    var City = function(itemData) {
        angular.extend(this, itemData);
    };
    return City;
})

.factory('Cities', function(City) {
    var Cities = (function() {
        var Cities = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams, City);
        });
        return Cities;
    }());
    return Cities;
})

.factory('citiesLoader', function(cityApi, Cities, City) {
    this.makeItem = function() {
        return _.assign({}, this);
    };

    this.makeCollection = function(itemsData, queryParams) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem);
        return new Cities(newItemsData, queryParams);
    };
});