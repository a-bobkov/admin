'use strict';

angular.module('max.dal.entities.group', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('groupApi', function(RestApi, Api) {
    var groupApi = new RestApi('groups', 'group');
    return groupApi;
})

.factory('Group', function(Item) {
    function Group(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Group.prototype, Item.prototype);
    return Group;
})

.factory('Groups', function(Collection, Group) {
    function Groups(itemsData, queryParams) {
        Collection.call(this, itemsData, Group, queryParams);
    };
    _.assign(Groups.prototype, Collection.prototype);
    return Groups;
})
;