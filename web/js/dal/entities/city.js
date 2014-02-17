'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi) {
   return new RestApi('cities', 'city');
})

.factory('cities', function(Collection, City, cityApi) {
    return (function() {

        var collection = inheritCollection(function() {
            this._registerCollection('city', 'cities', City, cityApi);
        }, Collection);

        return new collection;
    }());
})

.factory('City', function(Item) {
    var City = function () {};

    angular.extend(City.prototype, Item.prototype);

    return City;
})

.run(function(cities, City) {
});