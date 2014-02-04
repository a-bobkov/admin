'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.city'])

.factory('cities', function(Collection, cityApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(cityApi);

    return collection;
})

.factory('City', function(cities, Item) {
    var City = function () {};

    angular.extend(City.prototype, Item.prototype);

    return City;
})

.run(function(cities, City) {
    cities.setItemConstructor(City);
});
