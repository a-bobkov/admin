'use strict';

angular.module('max.dal.entities.tariffrate', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('tariffRateApi', function(RestApi, Api) {
    var tariffRateApi = new RestApi('tariffRates', 'tariffRate');
    return tariffRateApi;
})

.factory('TariffRate', function(Item) {
    var TariffRate = (function() {
        var entityParams = {
            dateFields: ['activeFrom'],
            refFields: {
                tariff: 'tariffs',
                city: 'cities'
            }
        };

        function TariffRate(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(TariffRate.prototype, Item.prototype);

        TariffRate.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        TariffRate.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        return TariffRate;
    }());
    return TariffRate;
})

.factory('TariffRates', function(Collection, TariffRate) {
    function TariffRates(itemsData, queryParams) {
        Collection.call(this, itemsData, TariffRate, queryParams);
    };
    _.assign(TariffRates.prototype, Collection.prototype);
    return TariffRates;
})

.service('tariffRatesLoader', function(tariffRateApi, TariffRate, TariffRates) {
    this.loadItems = function(queryParams) {
        return tariffRateApi.query(queryParams).then(function(tariffRatesData) {
            return new TariffRates(tariffRatesData, queryParams);
        });
    };
    this.loadItem = function(id) {
        return tariffRateApi.get(id).then(function(tariffRateData) {
            return new TariffRate(tariffRateData);
        });
    };
})
;