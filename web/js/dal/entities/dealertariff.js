'use strict';

angular.module('max.dal.entities.dealertariff', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerTariffApi', function(RestApi, Api) {
    var dealerTariffApi = new RestApi('dealerTariffs', 'dealerTariff');
    return dealerTariffApi;
})

.factory('DealerTariff', function(Item) {
    var DealerTariff = (function() {
        var entityParams = {
            refFields: {
                dealer: 'dealers',
                site: 'sites',
                tariff: 'tariffs'
            }
        };
        function DealerTariff(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(DealerTariff.prototype, Item.prototype);

        DealerTariff.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        DealerTariff.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        return DealerTariff;
    }());
    return DealerTariff;
})

.factory('DealerTariffs', function(Collection, DealerTariff) {
    function DealerTariffs(itemsData, queryParams) {
        Collection.call(this, itemsData, DealerTariff, queryParams);
    };
    _.assign(DealerTariffs.prototype, Collection.prototype);
    return DealerTariffs;
})

.service('dealerTariffsLoader', function(dealerTariffApi, DealerTariff, DealerTariffs) {
    this.loadItems = function(queryParams) {
        return dealerTariffApi.query(queryParams).then(function(dealerTariffsData) {
            return new DealerTariffs(dealerTariffsData, queryParams);
        });
    };
    this.loadItem = function(id) {
        return dealerTariffApi.get(id).then(function(dealerTariffData) {
            return new DealerTariff(dealerTariffData);
        });
    };
})
;