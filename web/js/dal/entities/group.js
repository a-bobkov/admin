'use strict';

angular.module('app.dal.entities.group', ['app.dal.entities.collection', 'app.dal.rest.group'])

.factory('groups', function(Collection, groupApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(groupApi);

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


angular.module('app.dal.rest.group', ['app.dal.static.api'])

.factory('groupApi', function(StaticApi) {
    return new StaticApi([
	    { 'id': 1, 'name': 'Катя'},
	    { 'id': 2, 'name': 'Инна'},
	    { 'id': 4, 'name': 'Потеряшки'},
	    { 'id': 0, 'name': 'Без тэга'}
	]);
});
