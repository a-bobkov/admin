'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection', 'app.dal.static.api'])

.factory('groupApi', function(StaticApi) {
    return new StaticApi();
})

.factory('groups', function(Collection, Group, groupApi) {
    return (function() {

        var collection = inherit(function() {
            this._registerCollection('group', 'groups', Group, groupApi);
        }, Collection);

        return new collection;
    }());
})

.factory('Group', function(Item) {
    var Group = function () {};

    angular.extend(Group.prototype, Item.prototype);

    return Group;
})

.run(function(groups, Group) {
});