'use strict';

angular.module('max.dal.entities.site', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('siteApi', function(RestApi, Api) {
    var siteApi = new RestApi('sites', 'site');
    return siteApi;
})

.factory('Site', function(Item) {

    var Site = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(Site.prototype, Item.prototype);
    return Site;
})

.factory('Sites', function(Collection) {
    var Sites = (function() {
        var Sites = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Sites.prototype, Collection.prototype);
        return Sites;
    }());
    return Sites;
})

.service('sitesLoader', function(siteApi, Site, Sites) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Site(itemData, directories);
        });
        return new Sites(items, queryParams);
    };

    this.loadItems = function(queryParams) {
        var self = this;
        return siteApi.query(queryParams).then(function(respond) {
            return {sites: self.makeCollection(respond.sites, respond.params)};
        });
    };
});