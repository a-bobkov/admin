'use strict';

angular.module('max.dal.entities.group', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('groupApi', function(RestApi, Api) {
    var groupApi = new RestApi('groups', 'group');
    return groupApi;
})

.factory('Group', function(Item) {

    var Group = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(Group.prototype, Item.prototype);
    return Group;
})

.factory('Groups', function(Collection) {
    var Groups = (function() {
        var Groups = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Groups.prototype, Collection.prototype);
        return Groups;
    }());
    return Groups;
})

.service('groupsLoader', function(Group, Groups) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Group(itemData, directories);
        });
        return new Groups(items, queryParams);
    };
});