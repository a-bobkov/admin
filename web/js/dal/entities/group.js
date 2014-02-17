'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection'])

.factory('groups', function(Collection, Group) {
    return (function() {

        var collection = inheritCollection(function() {
            this._registerCollection('group', 'groups', Group, undefined);
            this._setAll([
                { 'id': 1, 'name': 'Катя'},
                { 'id': 2, 'name': 'Инна'},
                { 'id': 4, 'name': 'Потеряшки'},
                { 'id': 0, 'name': 'Без тэга'}
            ]);
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