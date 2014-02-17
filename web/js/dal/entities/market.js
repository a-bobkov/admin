'use strict';

angular.module('app.dal.entities.market', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('marketApi', function(RestApi) {
   return new RestApi('markets', 'market');
})

.factory('markets', function(Collection, Market, marketApi) {
    return (function() {

        var collection = inherit(function() {
            this._registerCollection('market', 'markets', Market, marketApi);
        }, Collection);

        return new collection;
    }());
})

.factory('Market', function(Item) {
    var Market = function () {};

    angular.extend(Market.prototype, Item.prototype);

    return Market;
})

.run(function(markets, Market) {
});