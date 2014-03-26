'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('groupApi', function(RestApi, Api) {
    var groupApi = new RestApi('groups', 'group');
    return groupApi;
})

.factory('Group', function() {
    var Group = function(itemData) {
        angular.extend(this, itemData);
    };
    return Group;
})

.factory('Groups', function(Group) {
    var Groups = (function() {
        var Groups = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams, Group);
        });
        return Groups;
    }());
    return Groups;
})

.factory('groupsLoader', function(groupApi, Groups, Group) {
    this.makeItem = function() {
        return _.assign({}, this);
    };

    this.makeCollection = function(itemsData, queryParams) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem);
        return new Groups(newItemsData, queryParams);
    };
});