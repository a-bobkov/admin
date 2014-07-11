'use strict';

angular.module('max.dal.entities.sitebalance', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('SiteBalance', function(Item) {
    function SiteBalance(itemData) {
        Item.call(this, itemData);
    };
    _.assign(SiteBalance.prototype, Item.prototype);
    SiteBalance.prototype.lowerName = 'siteBalance';

    SiteBalance.prototype.entityParams = {
        refFields: {
            site: 'sites'
        }
    };

    return SiteBalance;
})

.factory('SiteBalances', function(Collection, SiteBalance) {
    function SiteBalances(itemsData, queryParams) {
        _.forEach(itemsData, function(itemData, itemIdx) {
            itemData.id = itemIdx;
        });
        Collection.call(this, itemsData, queryParams, SiteBalance, SiteBalances);
    };
    _.assign(SiteBalances.prototype, Collection.prototype);
    SiteBalances.prototype.lowerName = 'siteBalances';
    return SiteBalances;
})

.factory('siteBalanceApi', function(RestApi, Api) {
    var siteBalanceApi = new RestApi('siteBalances', 'siteBalance', 'report');
    return siteBalanceApi;
})

.service('siteBalancesLoader', function siteBalancesLoader(entityLoader, siteBalanceApi, SiteBalance, SiteBalances) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, siteBalanceApi, SiteBalances);
    };
})
;