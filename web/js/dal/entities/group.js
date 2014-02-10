'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection', 'app.dal.static.api'])

.factory('groupApi', function(StaticApi) {
    return new StaticApi();
})

.factory('groups', function(Collection, groupApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(groupApi);
    collection.registerChild ('group', 'groups');

    return collection;
})

.factory('Group', function(groups, Item) {
    var Group = function () {};

    angular.extend(Group.prototype, Item.prototype);

    return Group;
})

.run(function(groups, Group) {
    groups.setItemConstructor(Group);
});