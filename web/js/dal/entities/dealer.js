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

    	var pushPhone = function(name) {
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
		pushPhone.call(this, 'phone');
		pushPhone.call(this, 'phone2');
		pushPhone.call(this, 'phone3');
		return respond;
    }

    Dealer.prototype._serialize = function() {

    	var popPhone = function(name) {
    		var phone = itemData.phones.pop();
    		if (phone.phoneNumber || phone.phoneFrom || phone.phoneTo) {
    			itemData[name] = phone.phoneNumber;
    			itemData[name + '_from'] = phone.phoneFrom;
    			itemData[name + '_to'] = phone.phoneTo;
    		}    		
    	}

    	var itemData = Item.prototype._serialize.call(this);
    	if (angular.isArray(itemData.phones)) {
			popPhone('phone3');
			popPhone('phone2');
			popPhone('phone');
    		delete itemData.phones;
    	}
    	return itemData;
    };

    return Dealer;
})

.run(function(dealers, Dealer, dealerApi) {
    dealers._registerCollection('dealer', 'dealers', Dealer, dealerApi);
});