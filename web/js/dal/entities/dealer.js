'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi) {
   return new RestApi('dealers', 'dealer');
})

.factory('dealers', function(Collection, Dealer, dealerApi) {
    return (function() {

        var collection = inherit(function() {
            this.registerCollection('dealer', 'dealers', Dealer, dealerApi);
        }, Collection);

        return new collection;
    }());
})

.factory('Dealer', function(Item) {
    var Dealer = function () {};

    angular.extend(Dealer.prototype, Item.prototype);

    return Dealer;
})

.run(function(dealers, Dealer) {
});