'use strict';

angular.module('max.dal.entities.dealer', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerApi', function(RestApi, Api) {
    var dealerApi = new RestApi('dealers', 'dealer');
    return dealerApi;
})

.factory('Dealer', function(dealerApi, Item, dealerPhoneHours) {
    var Dealer = (function() {
        var entityParams = {
            enumFields: {
                phoneFrom: dealerPhoneHours,
                phoneTo: dealerPhoneHours,
                phone2From: dealerPhoneHours,
                phone2To: dealerPhoneHours,
                phone3From: dealerPhoneHours,
                phone3To: dealerPhoneHours
            },
            refFields: {
                manager: 'managers',
                city: 'cities',
                market: 'markets',
                metro: 'metros'
            }
        };
        function Dealer(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(Dealer.prototype, Item.prototype);

        Dealer.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        Dealer.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        Dealer.prototype.isValid = function() {
            return _.every(this, function(value, key) {
                if (_.has(value, 'id')) {    // ссылки пропускаем
                    return true;
                } else {
                    if (key === 'fax' && value) {
                        var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/
                        return value.match(regexpPhoneNumber);
                    } else {              // todo: валидация значений полей, кроме ссылок
                        return true;
                    }
                }
            });
        };

        return Dealer;
    }());
    return Dealer;
})

.factory('Dealers', function(Collection, Dealer) {
    function Dealers(itemsData, queryParams) {
        Collection.call(this, itemsData, Dealer, queryParams);
    };
    _.assign(Dealers.prototype, Collection.prototype);
    return Dealers;
})

.service('dealersLoader', function(saleApi, Dealers) {
    this.loadItems = function(queryParams) {
        return dealerApi.query(queryParams).then(function(dealersData) {
            return new Dealers(dealersData, queryParams);
        });
    };
})

.factory('DealerPhoneHour', function(Item) {
    function DealerPhoneHour(itemData) {
        Item.call(this, itemData);
    };
    _.assign(DealerPhoneHour.prototype, Item.prototype);
    return DealerPhoneHour;
})

.factory('dealerPhoneHours', function(Collection, DealerPhoneHour) {
    return new Collection([
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
    ], DealerPhoneHour);
})
;