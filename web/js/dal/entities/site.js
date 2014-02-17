'use strict';

angular.module('app.dal.entities.site', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('siteApi', function(RestApi) {
   return new RestApi('sites', 'site');
})

.factory('sites', function(Collection, Site, siteApi) {
    return (function() {

        var SitesCollection = inheritCollection(function() {
            this._registerCollection('site', 'sites', Site, siteApi);
        }, Collection);

        return new SitesCollection;
    }());
})

.factory('Site', function(Item) {
    var Site = function () {};

    angular.extend(Site.prototype, Item.prototype);

    return Site;
})

.run(function(sites, Site) {
});