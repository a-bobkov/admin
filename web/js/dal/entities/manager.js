'use strict';

angular.module('max.dal.entities.manager', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('managerApi', function(RestApi, Api) {
    var managerApi = new RestApi('managers', 'manager');
    return managerApi;
})

.factory('Manager', function(Item) {
    function Manager(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Manager.prototype, Item.prototype);
    return Manager;
})

.factory('Managers', function(Collection, Manager) {
    function Managers(itemsData, queryParams) {
        Collection.call(this, itemsData, Manager, queryParams);
    };
    _.assign(Managers.prototype, Collection.prototype);
    return Managers;
})
;