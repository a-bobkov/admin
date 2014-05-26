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
                } else if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else if (key === 'tariff') {
                    newValue = directories.tariffs.get(value.id);
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
            if (_.isObject(value)) {
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

.service('dealerTariffsLoader', function(dealerTariffApi, DealerTariff, DealerTariffs,
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

    this.loadItems = function(queryParams, oldDirectories) {
        var self = this;
        return dealerTariffApi.query(queryParams).then(function(dealerTariffsData) {
            var toResolve = [];
            if (!oldDirectories || !oldDirectories.dealers) {
                var dealerIds = _.pluck(_.compact(_.pluck(dealerTariffsData.dealerTariffs, 'dealer')), 'id');
                if (!_.isEmpty(dealerIds)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: dealerIds }
                        ]
                    };
                    toResolve.push(dealersLoader.loadItems(dealerQueryParams));
                }
            }
            if (!oldDirectories || !oldDirectories.sites) {
                var siteIds = _.pluck(_.compact(_.pluck(dealerTariffsData.dealerTariffs, 'site')), 'id');
                if (!_.isEmpty(siteIds)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: siteIds }
                        ]
                    };
                    toResolve.push(sitesLoader.loadItems(siteQueryParams));
                }
            }
            return $q.all(toResolve).then(function(directoriesArr) {
                var newDirectories = _.transform(directoriesArr, _.assign, {});
                var toResolve = [];
                if (!oldDirectories || !oldDirectories.tariffs) {
                    var tariffIds = _.pluck(_.compact(_.pluck([saleData.sale], 'tariff')), 'id');
                    if (!_.isEmpty(tariffIds)) {
                        var tariffQueryParams = {
                            filters: [
                                { fields: ['id'], type: 'in', value: tariffIds }
                            ]
                        };
                        toResolve.push(tariffsLoader.loadItems(tariffQueryParams, newDirectories));
                    }
                    toResolve.push(tariffsLoader.loadItems(tariffQueryParams, newDirectories));
                }
                return $q.all(toResolve).then(function(directoriesArr) {
                    _.transform(directoriesArr, _.assign, newDirectories);
                    var directories = _.assign({}, oldDirectories, newDirectories);
                    return _.assign(newDirectories, {dealerTariffs: self.makeCollection(dealerTariffsData.dealerTariffs, dealerTariffsData.params, directories)});
                });
            });
        });
    };
});