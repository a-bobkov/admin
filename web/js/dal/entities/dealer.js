'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi) {
   return new RestApi('dealers', 'dealer');
})

.factory('dealers', function(Collection) {
    return (function() {

        var DealersCollection = inheritCollection(function() {}, Collection);

        return new DealersCollection;
    }());
})

.factory('Dealer', function(Item) {
    var Dealer = function () {};

    angular.extend(Dealer.prototype, Item.prototype);

    return Dealer;
})

.run(function(dealers, Dealer, dealerApi) {
    dealers._registerCollection('dealer', 'dealers', Dealer, dealerApi);
});