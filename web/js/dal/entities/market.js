'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('marketApi', function(RestApi) {
   return new RestApi('markets', 'market');
})

.factory('markets', function(Collection, marketApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(marketApi);
    collection.registerChild ('market', 'markets');

    return collection;
})

.factory('Market', function(cities, Item) {
    var Market = function () {};

    angular.extend(Market.prototype, Item.prototype);

    return Market;
})

.run(function(markets, Market) {
    markets.setItemConstructor(Market);
});