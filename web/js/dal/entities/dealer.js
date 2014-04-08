'use strict';

angular.module('max.dal.entities.dealer', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerApi', function(RestApi, Api) {
    var dealerApi = new RestApi('dealers', 'dealer');
    return dealerApi;
})

.factory('Dealer', function(Item) {

    var Dealer = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {
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

    Dealer.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
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

    this.loadItems = function(queryParams) {
        var self = this;
        return dealerApi.query(queryParams).then(function(respond) {
            return {dealers: self.makeCollection(respond.dealers, respond.params)};
        });
    };
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