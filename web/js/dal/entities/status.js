'use strict';

angular.module('app.dal.entities.status', ['app.dal.entities.collection'])

.factory('statuses', function(Collection, Status) {
    return (function() {

        var collection = inheritCollection(function() {
            this._registerCollection('status', 'statuses', Status, undefined);
            this._setAll([
                { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
                { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
                { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
            ]);
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