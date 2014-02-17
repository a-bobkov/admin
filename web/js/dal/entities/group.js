'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection'])

.factory('groups', function(Collection) {
    return (function() {

        var GroupsCollection = inheritCollection(function() {}, Collection);

        return new GroupsCollection;
    }());
})

.factory('Group', function(Item) {
    var Group = function () {};

    angular.extend(Group.prototype, Item.prototype);

    return Group;
})

.run(function(groups, Group) {
    groups._registerCollection('group', 'groups', Group, undefined);
    groups._setAll([
        { 'id': 1, 'name': 'Катя'},
        { 'id': 2, 'name': 'Инна'},
        { 'id': 4, 'name': 'Потеряшки'},
        { 'id': 0, 'name': 'Без тэга'}
    ]);
});