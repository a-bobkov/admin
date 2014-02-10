'use strict';

angular.module('app.dal.entities.status', ['app.dal.entities.collection', 'app.dal.static.api'])

.factory('statusApi', function(StaticApi) {
    return new StaticApi([
        { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
        { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
        { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
    ]);
})

.factory('statuses', function(Collection, statusApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(statusApi);
    collection.registerChild ('status', 'statuses');

    return collection;
})

.factory('Status', function(statuses, Item) {
    var Status = function () {};

    angular.extend(Status.prototype, Item.prototype);

    return Status;
})

.run(function(statuses, Status) {
    statuses.setItemConstructor(Status);
});