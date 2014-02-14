'use strict';

angular.module('app.dal.entities.status', ['app.dal.entities.collection', 'app.dal.static.api'])

.factory('statusApi', function(StaticApi) {
    return new StaticApi([
        { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
        { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
        { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
    ]);
})

.factory('statuses', function(Collection, Status, statusApi) {
    return (function() {

        var collection = inherit(function() {
            this.registerCollection('status', 'statuses', Status, statusApi);
        }, Collection);

        return new collection;
    }());
})

.factory('Status', function(Item) {
    var Status = function () {};

    angular.extend(Status.prototype, Item.prototype);

    return Status;
})

.run(function(statuses, Status) {
});