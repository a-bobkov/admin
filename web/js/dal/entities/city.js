'use strict';

angular.module('max.dal.entities.city', ['max.dal.entities.collection'])

.factory('City', function(Item) {
    function City(itemData) {
        Item.call(this, itemData);
    };
    _.assign(City.prototype, Item.prototype);
    City.prototype.lowerName = 'city';
    return City;
})

.factory('Cities', function(Collection, City) {
    function Cities(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, City, Cities);
    };
    _.assign(Cities.prototype, Collection.prototype);
    return Cities;
})
;