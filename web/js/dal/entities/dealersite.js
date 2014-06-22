'use strict';

angular.module('max.dal.entities.dealersite', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerSiteApi', function(RestApi, Api) {
    var dealerSiteApi = new RestApi('dealerSites', 'dealerSite');
    return dealerSiteApi;
})

.factory('DealerSite', function(dealerSiteApi, Item, dealerSiteStatuses) {
    var DealerSite = (function() {
        var entityParams = {
            enumFields: {
                isActive: dealerSiteStatuses
            },
            refFields: {
                dealer: 'dealers',
                site: 'sites'
            }
        };
        function DealerSite(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(DealerSite.prototype, Item.prototype);

        DealerSite.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        DealerSite.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
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
        Collection.call(this, itemsData, DealerSite, queryParams);
    };
    _.assign(DealerSites.prototype, Collection.prototype);
    return DealerSites;
})

.service('dealerSitesLoader', function(dealerSiteApi, DealerSite, DealerSites) {
    this.loadItems = function(queryParams) {
        return dealerSiteApi.query(queryParams).then(function(dealerSitesData) {
            return new DealerSites(dealerSitesData, queryParams);
        });
    };
    this.loadItem = function(id) {
        return dealerSiteApi.get(id).then(function(dealerSiteData) {
            return new DealerSite(dealerSiteData);
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
    ], DealerSiteStatus);
})
;