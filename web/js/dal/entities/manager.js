'use strict';

angular.module('app.dal.entities.manager', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('managerApi', function(RestApi) {
   return new RestApi('managers', 'manager');
})

.factory('managers', function(Collection, Manager, managerApi) {
    return (function() {

        var collection = inherit(function() {
            this._registerCollection('manager', 'managers', Manager, managerApi);
        }, Collection);

        return new collection;
    }());
})

.factory('Manager', function(Item) {
    var Manager = function () {};

    angular.extend(Manager.prototype, Item.prototype);

    return Manager;
})

.run(function(managers, Manager) {
});