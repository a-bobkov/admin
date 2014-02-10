'use strict';

angular.module('app.dal.entities.metro', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('metroApi', function(RestApi) {
   return new RestApi('metros', 'metro');
})

.factory('metros', function(Collection, metroApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(metroApi);
    collection.registerChild ('metro', 'metros');

    return collection;
})

.factory('Metro', function(metros, Item) {
    var Metro = function () {};

    angular.extend(Metro.prototype, Item.prototype);

    return Metro;
})

.run(function(metros, Metro) {
    metros.setItemConstructor(Metro);
});