'use strict';

angular.module('max.dal.entities.group', ['max.dal.entities.collection'])

.factory('Group', function(Item) {
    function Group(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Group.prototype, Item.prototype);
    return Group;
})

.factory('Groups', function(Collection, Group) {
    function Groups(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Group, Groups);
    };
    _.assign(Groups.prototype, Collection.prototype);
    Groups.prototype.lowerName = 'groups';
    return Groups;
})

.factory('groupApi', function(RestApi, Api) {
    var groupApi = new RestApi('groups', 'group');
    return groupApi;
})

.service('groupsLoader', function groupsLoader(entityLoader, groupApi, Group, Groups) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, groupApi, Groups);
    };
})
;