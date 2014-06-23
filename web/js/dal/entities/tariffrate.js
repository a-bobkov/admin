'use strict';

angular.module('max.dal.entities.tariffrate', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('tariffRateApi', function(RestApi, Api) {
    var tariffRateApi = new RestApi('tariffRates', 'tariffRate');
    return tariffRateApi;
})

.factory('TariffRate', function(Item) {
    var TariffRate = (function() {
        function TariffRate(itemData) {
            Item.call(this, itemData);
        };
        _.assign(TariffRate.prototype, Item.prototype);

        TariffRate.prototype.lowerName = 'tariffRate';

        TariffRate.prototype.entityParams = {
            dateFields: ['activeFrom'],
            refFields: {
                tariff: 'tariffs',
                city: 'cities'
            }
        };

        return TariffRate;
    }());
    return TariffRate;
})

.factory('TariffRates', function(Collection, TariffRate) {
    function TariffRates(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, TariffRate, TariffRates);
    };
    _.assign(TariffRates.prototype, Collection.prototype);
    TariffRates.prototype.lowerName = 'tariffRates';
    return TariffRates;
})

.service('tariffRatesLoader', function(entityLoader, tariffRateApi, TariffRate, TariffRates) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, tariffRateApi, TariffRates);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, tariffRateApi, TariffRate);
    };
})
;