'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('groupApi', function(RestApi, Api) {
    var groupApi = new RestApi('groups', 'group');
    return groupApi;
})

.factory('Group', function() {

    var Group = function(itemData, directories) {
        _.extend(this, itemData);
    };
    return Group;
})

.factory('Groups', function() {
    
    var Groups = (function() {
        var Groups = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Groups;
    }());
    return Groups;
})

.factory('groupsLoader', function(Group, Groups) {

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