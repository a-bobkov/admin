'use strict';

angular.module('max.dal.entities.dealersite', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.dealer',
    'max.dal.entities.site'
])

.factory('dealerSiteApi', function(RestApi, Api) {
    var dealerSiteApi = new RestApi('dealerSites', 'dealerSite');
    return dealerSiteApi;
})

.factory('DealerSite', function(dealerSiteApi, Item) {

    var DealerSite = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'dealer') {
                    newValue = directories.dealers.get(value.id);
                } else if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else if (key === 'status') {
                newValue = directories.dealerSiteStatuses.get(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(DealerSite.prototype, Item.prototype);

    return DealerSite;
})

.factory('DealerSites', function(Collection) {
    var DealerSites = (function() {
        var DealerSites = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(DealerSites.prototype, Collection.prototype);
        return DealerSites;
    }());
    return DealerSites;
})

.service('dealerSitesLoader', function(dealerSiteApi, DealerSite, DealerSites, 
    dealerSiteStatusesLoader, dealersLoader, sitesLoader) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new DealerSite(itemData, directories);
        });
        return new DealerSites(items, queryParams);
    };

    this.loadItems = function(queryParams) {
        var self = this;
        return dealerSiteApi.query(queryParams).then(function(dealerSitesData) {
            var dealerIds = _.pluck(_.pluck(dealerSitesData, 'dealer'), 'id');
            var dealerQueryParams = {
                    fields: ['dealer_list_name'],
                    filters: [
                        { type: 'in', fields: ['id'], value: dealerIds }
                    ]
                };
            ;
            var siteIds = _.pluck(_.pluck(dealerSitesData, 'site'), 'id');
            var siteQueryParams = {
                    filters: [
                        { type: 'in', fields: ['id'], value: siteIds }
                    ]
                };
            return $q.all({
                dealers: dealersLoader.loadItems(dealerQueryParams),
                sites: sitesLoader.loadItems(siteQueryParams)
            }).then(function(directories) {
                directories.dealerSiteStatuses = dealerSiteStatusesLoader.makeCollection([
                    { 'id': 'active', 'name': 'Акт' },
                    { 'id': 'blocked', 'name': 'Бло' }
                ]);
                return _.extend(directories, {dealerSites: self.makeCollection(dealerSitesData.dealerSites, dealerSitesData.params, directories)});
            });
        });
    };
})

.factory('DealerSiteStatus', function(Item) {
    var DealerSiteStatus = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(DealerSiteStatus.prototype, Item.prototype);
    return DealerSiteStatus;
})

.factory('DealerSiteStatuses', function(Collection) {
    var DealerSiteStatuses = (function() {
        var DealerSiteStatuses = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(DealerSiteStatuses.prototype, Collection.prototype);
        return DealerSiteStatuses;
    }());
    return DealerSiteStatuses;
})

.service('userStatusesLoader', function(DealerSiteStatus, DealerSiteStatuses) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new DealerSiteStatus(itemData, directories);
        });
        return new DealerSiteStatuses(items, queryParams);
    };
});