'use strict';

angular.module('app.dal.entities.metro', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('metroApi', function(RestApi) {
   return new RestApi('metros', 'metro');
})

.factory('metros', function(Collection) {
    return (function() {

        var MetrosCollection = inheritCollection(function() {}, Collection);

        return new MetrosCollection;
    }());
})

.factory('Metro', function(Item) {
    var Metro = function () {};

    angular.extend(Metro.prototype, Item.prototype);

    return Metro;
})

.run(function(metros, Metro, metroApi) {
    metros._registerCollection('metro', 'metros', Metro, metroApi);
});