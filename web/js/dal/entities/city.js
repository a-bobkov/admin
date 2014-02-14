'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('cityApi', function(RestApi) {
   return new RestApi('cities', 'city');
})

.factory('cities', function(Collection, City, cityApi) {
return (function() {

    var Child = inherit(function() {
        this.setRestApiProvider(cityApi);
        this.registerChild('city', 'cities', City);
    }, Collection);

    return new Child;
}());
})

.factory('City', function(Item) {
    var City = function () {};

    angular.extend(City.prototype, Item.prototype);

    return City;
})

.run(function(cities, City) {
});