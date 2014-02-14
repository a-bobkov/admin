'use strict';

angular.module('app.dal.entities.metro', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('metroApi', function(RestApi) {
   return new RestApi('metros', 'metro');
})

.factory('metros', function(Collection, Metro, metroApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(metroApi);
    collection.registerChild ('metro', 'metros', Metro);

    return collection;
})

.factory('Metro', function(Item) {
    var Metro = function () {};

    angular.extend(Metro.prototype, Item.prototype);

    return Metro;
})

.run(function(metros, Metro) {
});