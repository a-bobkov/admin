'use strict';

angular.module('app.dal.entities.dealer', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('dealerApi', function(RestApi, Api) {
    var dealerApi = new RestApi('dealers', 'dealer');
    return dealerApi;
})

.factory('Dealer', function(Item) {

    var Dealer = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value.id) {
                if (key === 'manager') {
                    newValue = directories.managers.get(value.id);
                } else if (key === 'city') {
                    newValue = directories.cities.get(value.id);
                } else if (key === 'market') {
                    newValue = directories.markets.get(value.id);
                } else if (key === 'metro') {
                    newValue = directories.metros.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(Dealer.prototype, Item.prototype);

    Dealer.prototype.serialize = function() {

        var itemData = Item.prototype.serialize.call(this);
        
        function popPhone(name) {
            var phone = itemData.phones.pop();
            if (phone.phoneNumber || phone.phoneFrom || phone.phoneTo) {
                itemData[name] = phone.phoneNumber;
                itemData[name + '_from'] = phone.phoneFrom;
                itemData[name + '_to'] = phone.phoneTo;
            }           
        }

        if (_.isArray(itemData.phones)) {
            popPhone('phone3');
            popPhone('phone2');
            popPhone('phone');
            delete itemData.phones;
        }
        return itemData;
    };

    return Dealer;
})

.factory('Dealers', function(Collection) {
    var Dealers = (function() {
        var Dealers = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Dealers.prototype, Collection.prototype);
        return Dealers;
    }());
    return Dealers;
})

.service('dealersLoader', function(Dealer, Dealers) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Dealer(itemData, directories);
        });
        return new Dealers(items, queryParams);
    };
});