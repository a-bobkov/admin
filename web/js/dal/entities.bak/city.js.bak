'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi) {
   return new RestApi('cities', 'city');
})

.factory('cities', function(Collection) {
    return (function() {

        var CitiesCollection = inheritCollection(function() {}, Collection);

        return new CitiesCollection;
    }());
})

.factory('City', function(Item) {
    var City = function () {};

    angular.extend(City.prototype, Item.prototype);

    return City;
})

.run(function(cities, City, cityApi) {
    cities._registerCollection('city', 'cities', City, cityApi);
});