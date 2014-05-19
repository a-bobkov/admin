'use strict';

angular.module('max.dal.entities.tariffrate', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.tariff',
    'max.dal.entities.city'
])

.factory('tariffRateApi', function(RestApi, Api) {
    var tariffRateApi = new RestApi('tariffRates', 'tariffRate');
    return tariffRateApi;
})

.factory('TariffRate', function(tariffRateApi, Item) {

    var TariffRate = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'tariff') {
                    newValue = directories.tariffs.get(value.id);
                } else if (key === 'city') {
                    newValue = directories.cities.get(value.id);
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

    _.extend(TariffRate.prototype, Item.prototype);

    TariffRate.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    TariffRate.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return Tariff;
})

.factory('TariffRates', function(Collection) {
    var TariffRates = (function() {
        var TariffRates = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(TariffRates.prototype, Collection.prototype);
        return TariffRates;
    }());
    return TariffRates;
})

.service('tariffRatesLoader', function(tariffRateApi, TariffRate, TariffRates,
    tariffsLoader, citiesLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new TariffRate(itemData, directories);
        });
        return new TariffRates(items, queryParams);
    };
});