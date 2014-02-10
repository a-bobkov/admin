'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi) {
   return new RestApi('dealers', 'dealer');
})

.factory('dealers', function(Collection, dealerApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(dealerApi);
    collection.registerChild ('dealer', 'dealers');

    return collection;
})

.factory('Dealer', function(dealers, Item) {
    var Dealer = function () {};

    angular.extend(Dealer.prototype, Item.prototype);

    return Dealer;
})

.run(function(dealers, Dealer) {
    dealers.setItemConstructor(Dealer);
});