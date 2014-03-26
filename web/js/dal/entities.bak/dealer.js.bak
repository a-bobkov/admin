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
    var Dealer = function () {
        this.phones = [{}, {}, {}];
    };

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
})

.service('dealerPhoneHours', function() {
    this.data = [
        { 'id':  0, 'name':  '0:00'},
        { 'id':  1, 'name':  '1:00'},
        { 'id':  2, 'name':  '2:00'},
        { 'id':  3, 'name':  '3:00'},
        { 'id':  4, 'name':  '4:00'},
        { 'id':  5, 'name':  '5:00'},
        { 'id':  6, 'name':  '6:00'},
        { 'id':  7, 'name':  '7:00'},
        { 'id':  8, 'name':  '8:00'},
        { 'id':  9, 'name':  '9:00'},
        { 'id': 10, 'name': '10:00'},
        { 'id': 11, 'name': '11:00'},
        { 'id': 12, 'name': '12:00'},
        { 'id': 13, 'name': '13:00'},
        { 'id': 14, 'name': '14:00'},
        { 'id': 15, 'name': '15:00'},
        { 'id': 16, 'name': '16:00'},
        { 'id': 17, 'name': '17:00'},
        { 'id': 18, 'name': '18:00'},
        { 'id': 19, 'name': '19:00'},
        { 'id': 20, 'name': '20:00'},
        { 'id': 21, 'name': '21:00'},
        { 'id': 22, 'name': '22:00'},
        { 'id': 23, 'name': '23:00'},
        { 'id': 24, 'name': '24:00'}
    ];
});