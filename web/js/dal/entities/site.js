'use strict';

angular.module('app.dal.entities.site', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('siteApi', function(RestApi) {
   return new RestApi('sites', 'site');
})

.factory('sites', function(Collection, Site, siteApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(siteApi);
    collection.registerChild ('site', 'sites', Site);

    return collection;
})

.factory('Site', function(Item) {
    var Site = function () {};

    angular.extend(Site.prototype, Item.prototype);

    return Site;
})

.run(function(sites, Site) {
});