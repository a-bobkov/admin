'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.market'])

.factory('markets', function(Collection, marketApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(marketApi);

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
