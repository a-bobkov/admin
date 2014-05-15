'use strict';

angular.module('max.dal.entities.dealersite', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.dealer',
    'max.dal.entities.site',
    'max.dal.entities.dealersitelogin'
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
            } else if (key === 'isActive') {
                newValue = directories.dealerSiteStatuses.get(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(DealerSite.prototype, Item.prototype);

    DealerSite.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    DealerSite.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (key === 'isActive') {
                itemData[key] = value.id;
            } else if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    DealerSite.prototype.save = function(directories) {
        if (this.id) {
            return dealerSiteApi.update(this.serialize()).then(function(respond) {
                return new DealerSite(respond.dealerSite, directories);
            });
        } else {
            return dealerSiteApi.create(this.serialize()).then(function(respond) {
                return new DealerSite(respond.dealerSite, directories);
            });
        }
    };

    DealerSite.prototype.remove = function() {
        if (this.id) {
            return dealerSiteApi.remove(this.id);
        }
        throw new CollectionError('Попытка удалить элемент без id');
    };

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
    dealerSiteStatusesLoader, dealersLoader, sitesLoader, dealerSiteLoginsLoader, $q) {

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
            function getFilterFieldsValue(filters, fields) {
                var filter = _.find(filters, {fields: fields});
                if (filter) {
                    return filter.value;
                }
            }

            var dealerIds = getFilterFieldsValue(queryParams.filters, ['dealer'])
            if (_.isEmpty(dealerIds)) {
                dealerIds = _.pluck(_.pluck(dealerSitesData.dealerSites, 'dealer'), 'id');
            }
            var dealerQueryParams = {
                filters: [
                    { type: 'in', fields: ['user.id'], value: dealerIds }
                ],
                fields: [ 'dealer_list_name' ]
            };

            var siteIds = getFilterFieldsValue(queryParams.filters, ['site'])
            if (_.isEmpty(siteIds)) {
                siteIds = _.pluck(_.pluck(dealerSitesData.dealerSites, 'site'), 'id');
            }
            var siteQueryParams = {
                filters: [
                    { type: 'in', fields: ['id'], value: siteIds }
                ]
            };
            return $q.all({
                dealers: dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                    return respond.dealers;
                }),
                sites: sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                    return respond.sites;
                }),
                dealerSiteStatuses: dealerSiteStatusesLoader.loadItems().then(function(respond) {
                    return respond.dealerSiteStatuses;
                })
            }).then(function(directories) {
                return _.extend(directories, {dealerSites: self.makeCollection(dealerSitesData.dealerSites, dealerSitesData.params, directories)});
            });
        });
    };

    this.loadItem = function(id) {
        var self = this;
        return dealerSiteApi.get(id).then(function(dealerSiteData) {
            var dealerQueryParams = {
                filters: [
                    { type: 'equal', fields: ['user.id'], value: dealerSiteData.dealerSite.dealer.id }
                ],
                fields: [ 'dealer_list_name' ]
            };
            var siteQueryParams = {
                filters: [
                    { type: 'equal', fields: ['id'], value: dealerSiteData.dealerSite.site.id }
                ]
            };
            return $q.all({
                dealers: dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                    return respond.dealers;
                }),
                sites: sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                    return respond.sites;
                }),
                dealerSiteStatuses: dealerSiteStatusesLoader.loadItems().then(function(respond) {
                    return respond.dealerSiteStatuses;
                })
            }).then(function(directories) {
                directories.dealerSite = new DealerSite(dealerSiteData.dealerSite, directories);
                return directories;
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

.service('dealerSiteStatusesLoader', function(DealerSiteStatus, DealerSiteStatuses, $q) {

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

    this.loadItems = function() {
        var self = this;
        return $q.when({dealerSiteStatuses: self.makeCollection([
            { id: true, name: 'Акт' },
            { id: false, name: 'Бло' }
        ])});
    };
});