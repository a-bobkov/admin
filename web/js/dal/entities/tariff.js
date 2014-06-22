'use strict';

angular.module('max.dal.entities.tariff', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('tariffApi', function(RestApi, Api) {
    var tariffApi = new RestApi('tariffs', 'tariff');
    return tariffApi;
})

.factory('Tariff', function(Item, tariffPeriodUnits) {
    var Tariff = (function() {
        var entityParams = {
            enumFields: {
                periodUnit: tariffPeriodUnits
            },
            refFields: {
                site: 'sites'
            }
        };

        function Tariff(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(Tariff.prototype, Item.prototype);

        Tariff.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        Tariff.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
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
            return rate + ' руб. за ' + this.period + '  ' + this.periodUnitName() +
                ((this.count) ? ', до ' + this.count + ' объявлений' : '') +
                ((this.isActive) ? '' : ' (Н/А)');
        }

        return Tariff;
    }());
    return Tariff;
})

.factory('Tariffs', function(Collection, Tariff) {
    function Tariffs(itemsData, queryParams) {
        Collection.call(this, itemsData, Tariff, queryParams);
    };
    _.assign(Tariffs.prototype, Collection.prototype);
    return Tariffs;
})

.service('tariffsLoader', function(tariffApi, Tariff, Tariffs) {
    this.loadItems = function(queryParams) {
        return tariffApi.query(queryParams).then(function(tariffsData) {
            return new Tariffs(tariffsData, queryParams);
        });
    };
    this.loadItem = function(id) {
        return tariffApi.get(id).then(function(tariffsData) {
            return new Tariff(tariffsData);
        });
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
    ], TariffPeriodUnit);
})
;