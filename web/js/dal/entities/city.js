'use strict';

angular.module('max.dal.entities.city', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('cityApi', function(RestApi, Api) {
    var cityApi = new RestApi('cities', 'city');
    return cityApi;
})

.factory('City', function(Item) {
    function City(itemData) {
        Item.call(this, itemData);
    };
    _.assign(City.prototype, Item.prototype);
    return City;
})

.factory('Cities', function(Collection, City) {
    function Cities(itemsData, queryParams) {
        Collection.call(this, itemsData, City, queryParams);
    };
    _.assign(Cities.prototype, Collection.prototype);
    return Cities;
})
;