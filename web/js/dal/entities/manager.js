'use strict';

angular.module('max.dal.entities.manager', ['max.dal.entities.collection'])

.factory('Manager', function(Item) {
    function Manager(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Manager.prototype, Item.prototype);
    return Manager;
})

.factory('Managers', function(Collection, Manager) {
    function Managers(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Manager, Managers);
    };
    _.assign(Managers.prototype, Collection.prototype);
    Managers.prototype.lowerName = 'managers';
    return Managers;
})

.factory('managerApi', function(RestApi, Api) {
    var managerApi = new RestApi('managers', 'manager');
    return managerApi;
})

.service('managersLoader', function managersLoader(entityLoader, managerApi, Manager, Managers) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, managerApi, Managers);
    };
})
;