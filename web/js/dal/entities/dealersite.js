'use strict';

angular.module('max.dal.entities.dealersite', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerSiteApi', function(RestApi, Api) {
    var dealerSiteApi = new RestApi('dealerSites', 'dealerSite');
    return dealerSiteApi;
})

.factory('DealerSite', function(dealerSiteApi, Item, dealerSiteStatuses) {
    var DealerSite = (function() {
        function DealerSite(itemData) {
            Item.call(this, itemData);
        };
        _.assign(DealerSite.prototype, Item.prototype);

        DealerSite.prototype.lowerName = 'dealerSite';

        DealerSite.prototype.entityParams = {
            enumFields: {
                isActive: dealerSiteStatuses
            },
            refFields: {
                dealer: 'dealers',
                site: 'sites'
            }
        };

        DealerSite.prototype.save = function(directories) {
            if (this.id) {
                return dealerSiteApi.update(this.serialize()).then(function(respond) {
                    return new DealerSite(respond.dealerSite).resolveRefs(directories);
                });
            } else {
                return dealerSiteApi.create(this.serialize()).then(function(respond) {
                    return new DealerSite(respond.dealerSite).resolveRefs(directories);
                });
            }
        };

        DealerSite.prototype.remove = function() {
            if (this.id) {
                return dealerSiteApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        DealerSite.prototype.name = function() {
            return 'салона "' + this.dealer.companyName + '" на сайте "' + this.site.name + '"';
        }

        return DealerSite;
    }());
    return DealerSite;
})

.factory('DealerSites', function(Collection, DealerSite) {
    function DealerSites(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, DealerSite, DealerSites);
    };
    _.assign(DealerSites.prototype, Collection.prototype);
    DealerSites.prototype.lowerName = 'dealerSites';
    return DealerSites;
})

.service('dealerSitesLoader', function(entityLoader, dealerSiteApi, DealerSite, DealerSites) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, dealerApi, Dealers);
    };
})

.service('dealerSitesLoader', function(entityLoader, dealerSiteApi, DealerSite, DealerSites) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, dealerSiteApi, DealerSites);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, dealerSiteApi, DealerSite);
    };
    this.loadItemActiveDealerSite = function(dealerId, siteId, directories) {
        return this.loadItems({
            filters: [
                { fields: ['dealer'], type: 'equal', value: dealerId },
                { fields: ['site'], type: 'equal', value: siteId },
                { fields: ['isActive'], type: 'equal', value: true }
            ]
        }, directories).then(function(dealerSites) {
            return dealerSites.getItems()[0];
        });
    };
})

.factory('DealerSiteStatus', function(Item) {
    function DealerSiteStatus(itemData) {
        Item.call(this, itemData);
    };
    _.assign(DealerSiteStatus.prototype, Item.prototype);
    return DealerSiteStatus;
})

.factory('dealerSiteStatuses', function(Collection, DealerSiteStatus) {
    return new Collection([
        { id: true, name: 'Акт' },
        { id: false, name: 'Бло' }
    ], null, DealerSiteStatus);
})
;