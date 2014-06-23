'use strict';

angular.module('max.dal.entities.site', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('siteApi', function(RestApi, Api) {
    var siteApi = new RestApi('sites', 'site');
    return siteApi;
})

.factory('Site', function(Item) {
    function Site(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Site.prototype, Item.prototype);
    Site.prototype.lowerName = 'site';
    return Site;
})

.factory('Sites', function(Collection, Site) {
    function Sites(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Site, Sites);
    };
    _.assign(Sites.prototype, Collection.prototype);
    Sites.prototype.lowerName = 'sites';
    return Sites;
})

.service('sitesLoader', function(entityLoader, siteApi, Site, Sites) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, siteApi, Sites);
    };
})
;