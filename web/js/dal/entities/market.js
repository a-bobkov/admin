'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('marketApi', function(RestApi) {
   return new RestApi('markets', 'market');
})

.factory('markets', function(Collection) {
    return (function() {

        var MarketsCollection = inheritCollection(function() {}, Collection);

        return new MarketsCollection;
    }());
})

.factory('Market', function(Item) {
    var Market = function () {};

    angular.extend(Market.prototype, Item.prototype);

    return Market;
})

.run(function(markets, Market, marketApi) {
    markets._registerCollection('market', 'markets', Market, marketApi);
});