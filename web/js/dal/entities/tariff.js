'use strict';

angular.module('max.dal.entities.tariff', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.site'
])

.factory('tariffApi', function(RestApi, Api) {
    var tariffApi = new RestApi('tariffs', 'tariff');
    return tariffApi;
})

.factory('Tariff', function(tariffApi, Item) {

    var Tariff = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else if (key === 'type') {
                newValue = directories.tariffTypes.get(value);
            } else if (key === 'periodUnit') {
                newValue = directories.tariffPeriodUnits.get(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(Tariff.prototype, Item.prototype);

    Tariff.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    Tariff.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (key === 'type' || key === 'periodUnit') {
                itemData[key] = value.id;
            } else if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return Tariff;
})

.factory('Tariffs', function(Collection) {
    var Tariffs = (function() {
        var Tariffs = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Tariffs.prototype, Collection.prototype);
        return Tariffs;
    }());
    return Tariffs;
})

.service('tariffsLoader', function(tariffApi, Tariff, Tariffs, tariffTypesLoader, tariffStatusesLoader,
    sitesLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Tariff(itemData, directories);
        });
        return new Tariffs(items, queryParams);
    };
})

.factory('TariffType', function(Item) {
    var TariffType = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(TariffType.prototype, Item.prototype);
    return TariffType;
})

.factory('TariffTypes', function(Collection) {
    var TariffTypes = (function() {
        var TariffTypes = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(TariffTypes.prototype, Collection.prototype);
        return TariffTypes;
    }());
    return TariffTypes;
})

.service('tariffTypesLoader', function(TariffType, TariffTypes, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new TariffType(itemData, directories);
        });
        return new TariffTypes(items, queryParams);
    };

    this.loadItems = function() {
        var self = this;
        return $q.when({saleTypes: self.makeCollection([
            { id: 'daily', name: 'Подневный' },
            { id: 'periodical', name: 'Периодический' }
        ])});
    };
})

.factory('TariffPeriodUnit', function(Item) {
    var TariffPeriodUnit = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(TariffPeriodUnit.prototype, Item.prototype);
    return TariffPeriodUnit;
})

.factory('TariffPeriodUnits', function(Collection) {
    var TariffPeriodUnits = (function() {
        var TariffPeriodUnits = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(TariffPeriodUnits.prototype, Collection.prototype);
        return TariffPeriodUnits;
    }());
    return TariffPeriodUnits;
})

.service('tariffPeriodUnitsLoader', function(TariffPeriodUnit, TariffPeriodUnits, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new TariffPeriodUnit(itemData, directories);
        });
        return new TariffPeriodUnits(items, queryParams);
    };

    this.loadItems = function() {
        var self = this;
        return $q.when({tariffPeriodUnits: self.makeCollection([
            { id: 'day', name: 'День' },
            { id: 'month', name: 'Месяц' }
        ])});
    };
});