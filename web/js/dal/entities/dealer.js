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

    Dealer.prototype._fillItem = function(itemData) {

    	var packPhone = function(name) {
			this.phones.push({
				phoneNumber: this[name],
				phoneFrom: this[name + '_from'],
				phoneTo: this[name + '_to']
			});
			delete this[name];
			delete this[name + '_from'];
			delete this[name + '_to'];
    	}

		var respond = Item.prototype._fillItem.call(this, itemData);
		this.phones = [];
		packPhone.call(this, 'phone');
		packPhone.call(this, 'phone2');
		packPhone.call(this, 'phone3');
		return respond;
    }

    Dealer.prototype._serialize = function() {
    	var respond = Item.prototype._serialize.call(this);
    	if (respond.phones) {
    		if (respond.phones[0]) {
    			respond.phone = respond.phones[0].phoneNumber;
    			respond.phone_from = respond.phones[0].phoneFrom;
    			respond.phone_to = respond.phones[0].phoneTo;
    		}
    		if (respond.phones[1]) {
    			respond.phone2 = respond.phones[1].phoneNumber;
    			respond.phone2_from = respond.phones[1].phoneFrom;
    			respond.phone2_to = respond.phones[1].phoneTo;
    		}
    		if (respond.phones[2]) {
    			respond.phone3 = respond.phones[2].phoneNumber;
    			respond.phone3_from = respond.phones[2].phoneFrom;
    			respond.phone3_to = respond.phones[2].phoneTo;
    		}
    		delete respond.phones;
    	}
    	return respond;
    };

    return Dealer;
})

.run(function(dealers, Dealer, dealerApi) {
    dealers._registerCollection('dealer', 'dealers', Dealer, dealerApi);
});