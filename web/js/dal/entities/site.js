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
    return Site;
})

.factory('Sites', function(Collection, Site) {
    function Sites(itemsData, queryParams) {
        Collection.call(this, itemsData, Site, queryParams);
    };
    _.assign(Sites.prototype, Collection.prototype);
    return Sites;
})

.service('sitesLoader', function(siteApi, Site, Sites) {
    this.loadItems = function(queryParams) {
        return siteApi.query(queryParams).then(function(sitesData) {
            return new Sites(sitesData, queryParams);
        });
    };
})
;