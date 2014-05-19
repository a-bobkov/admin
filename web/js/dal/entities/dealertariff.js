'use strict';

angular.module('max.dal.entities.dealertariff', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.dealer',
    'max.dal.entities.site',
    'max.dal.entities.tariff'
])

.factory('dealerTariffApi', function(RestApi, Api) {
    var dealerTariffApi = new RestApi('dealerTariffs', 'dealerTariff');
    return dealerTariffApi;
})

.factory('DealerTariff', function(dealerTariffApi, Item) {

    var DealerTariff = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'dealer') {
                    newValue = directories.dealers.get(value.id);
                if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                if (key === 'tariff') {
                    newValue = directories.tariffs.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else if (key === 'renew') {
                newValue = directories.dealerTariffRenew.get(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(DealerTariff.prototype, Item.prototype);

    DealerTariff.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    DealerTariff.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (key === 'renew') {
                itemData[key] = value.id;
            } else if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return DealerTariff;
})

.factory('DealerTariffs', function(Collection) {
    var DealerTariffs = (function() {
        var DealerTariffs = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(DealerTariffs.prototype, Collection.prototype);
        return DealerTariffs;
    }());
    return DealerTariffs;
})

.service('dealerTariffsLoader', function(dealerTariffApi, DealerTariff, DealerTariffs, dealerTariffRenewsLoader,
    dealersLoader, sitesLoader, tariffsLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new DealerTariff(itemData, directories);
        });
        return new DealerTariffs(items, queryParams);
    };
})

.factory('DealerTariffRenew', function(Item) {
    var DealerTariffRenew = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(DealerTariffRenew.prototype, Item.prototype);
    return DealerTariffRenew;
})

.factory('DealerTariffRenews', function(Collection) {
    var DealerTariffRenews = (function() {
        var DealerTariffRenews = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(DealerTariffRenews.prototype, Collection.prototype);
        return DealerTariffRenews;
    }());
    return DealerTariffRenews;
})

.service('dealerTariffRenewsLoader', function(DealerTariffRenew, DealerTariffRenews, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new DealerTariffRenew(itemData, directories);
        });
        return new DealerTariffRenews(items, queryParams);
    };

    this.loadItems = function() {
        var self = this;
        return $q.when({dealerTariffRenews: self.makeCollection([
            { id: '0', name: 'Нет' },
            { id: '10', name: '10%' },
            { id: '20', name: '20%' },
            { id: '30', name: '30%' },
            { id: '100', name: '100%' }
        ])});
    };
});