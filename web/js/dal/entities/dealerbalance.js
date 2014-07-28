'use strict';

angular.module('max.dal.entities.dealerbalance', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('DealerBalance', function(Item) {
    function DealerBalance(itemData) {
        Item.call(this, itemData);
    };
    _.assign(DealerBalance.prototype, Item.prototype);
    DealerBalance.prototype.lowerName = 'dealerBalance';

    DealerBalance.prototype.entityParams = {
        refFields: {
            dealer: 'dealers'
        }
    };

    return DealerBalance;
})

.factory('DealerBalances', function(Collection, DealerBalance) {
    function DealerBalances(itemsData, queryParams) {
        _.forEach(itemsData, function(itemData, itemIdx) {
            itemData.id = itemIdx;
        });
        Collection.call(this, itemsData, queryParams, DealerBalance, DealerBalances);
    };
    _.assign(DealerBalances.prototype, Collection.prototype);
    DealerBalances.prototype.lowerName = 'dealerBalances';
    return DealerBalances;
})

.factory('dealerBalanceApi', function(RestApi, Api) {
    var dealerBalanceApi = new RestApi('dealerBalances', 'dealerBalance', 'report');
    return dealerBalanceApi;
})

.service('dealerBalancesLoader', function dealerBalancesLoader(entityLoader, dealerBalanceApi, DealerBalance, DealerBalances) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, dealerBalanceApi, DealerBalances);
    };
    this.loadItemDealer = function(dealerId, directories) {
        return this.loadItems({
            filters: [
                { fields: ['dealer'], type: 'equal', value: dealerId }
            ]
        }, directories).then(function(dealerBalances) {
            return dealerBalances.getItems()[0];
        });
    };
})
;