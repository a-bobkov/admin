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
    return Managers;
})
;