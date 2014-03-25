'use strict';

angular.module('app.dal.entities.site', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('siteApi', function(RestApi, Api) {
    var siteApi = new RestApi('sites', 'site');
    return siteApi;
})

.factory('Site', function() {
    var Site = function(itemData) {
        angular.extend(this, itemData);
    };
    return Site;
})

.factory('Sites', function(Site) {
    var Sites = (function() {
        var Sites = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams, Site);
        });
        return Sites;
    }());
    return Sites;
})

.factory('groupsLoader', function(groupApi, Sites, Site) {
    this.makeItem = function() {
        return _.assign({}, this);
    });

    this.makeCollection = function(itemsData, queryParams) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem);
        return new Sites(newItemsData, queryParams);
    };
});