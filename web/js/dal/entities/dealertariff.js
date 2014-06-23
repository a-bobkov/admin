'use strict';

angular.module('max.dal.entities.dealertariff', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerTariffApi', function(RestApi, Api) {
    var dealerTariffApi = new RestApi('dealerTariffs', 'dealerTariff');
    return dealerTariffApi;
})

.factory('DealerTariff', function(Item) {
    var DealerTariff = (function() {
        function DealerTariff(itemData) {
            Item.call(this, itemData);
        };
        _.assign(DealerTariff.prototype, Item.prototype);

        DealerTariff.prototype.lowerName = 'dealerTariff';

        DealerTariff.prototype.entityParams = {
            refFields: {
                dealer: 'dealers',
                site: 'sites',
                tariff: 'tariffs'
            }
        };

        return DealerTariff;
    }());
    return DealerTariff;
})

.factory('DealerTariffs', function(Collection, DealerTariff) {
    function DealerTariffs(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, DealerTariff, DealerTariffs);
    };
    _.assign(DealerTariffs.prototype, Collection.prototype);
    DealerTariffs.prototype.lowerName = 'dealerTariffs';
    return DealerTariffs;
})

.service('dealerTariffsLoader', function(entityLoader, dealerTariffApi, DealerTariff, DealerTariffs) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, dealerTariffApi, DealerTariffs);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItems(id, directories, dealerTariffApi, DealerTariff);
    };
})
;