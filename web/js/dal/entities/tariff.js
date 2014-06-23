'use strict';

angular.module('max.dal.entities.tariff', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('tariffApi', function(RestApi, Api) {
    var tariffApi = new RestApi('tariffs', 'tariff');
    return tariffApi;
})

.factory('Tariff', function(Item, tariffPeriodUnits) {
    var Tariff = (function() {
        function Tariff(itemData) {
            Item.call(this, itemData);
        };
        _.assign(Tariff.prototype, Item.prototype);

        Tariff.prototype.lowerName = 'tariff';

        Tariff.prototype.entityParams = {
            enumFields: {
                periodUnit: tariffPeriodUnits
            },
            refFields: {
                site: 'sites'
            }
        };

        Tariff.prototype.getLastRate = function(city, tariffRates) {
                var thisTariffRates = _.filter(tariffRates, {tariff: this});
                var thisTariffRatesCity = _.filter(thisTariffRates, {city: city});
                if (thisTariffRatesCity.length) {
                    _.sortBy(thisTariffRatesCity, 'activeFrom');
                    return  thisTariffRatesCity[thisTariffRatesCity.length - 1];
                }
                var thisTariffRatesNull = _.filter(thisTariffRates, {city: null});
                if (thisTariffRatesNull.length) {
                    _.sortBy(thisTariffRatesNull, 'activeFrom');
                    return  thisTariffRatesNull[thisTariffRatesNull.length - 1];
                }
            }

        Tariff.prototype.name = function(city, tariffRates) {
            var tariffRate = this.getLastRate(city, tariffRates);
            var rate = (tariffRate) ? tariffRate.rate : '???';
            return rate + ' руб. за ' + this.period + '  ' + this.periodUnit.name +
                ((this.count) ? ', до ' + this.count + ' объявлений' : '') +
                ((this.isActive) ? '' : ' (Н/А)');
        }

        return Tariff;
    }());
    return Tariff;
})

.factory('Tariffs', function(Collection, Tariff) {
    function Tariffs(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Tariff, Tariffs);
    };
    _.assign(Tariffs.prototype, Collection.prototype);
    Tariffs.prototype.lowerName = 'tariffs';
    return Tariffs;
})

.service('tariffsLoader', function(entityLoader, tariffApi, Tariff, Tariffs) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, tariffApi, Tariffs);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, tariffApi, Tariff);
    };
})

.factory('TariffPeriodUnit', function(Item) {
    function TariffPeriodUnit(itemData) {
        Item.call(this, itemData);
    };
    _.assign(TariffPeriodUnit.prototype, Item.prototype);
    return TariffPeriodUnit;
})

.factory('tariffPeriodUnits', function(Collection, TariffPeriodUnit) {
    return new Collection([
        { id: 'day', name: 'дн.' },
        { id: 'month', name: 'мес.' }
    ], null, TariffPeriodUnit);
})
;