'use strict';

angular.module('app.dal.entities.manager', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('managerApi', function(RestApi) {
   return new RestApi('managers', 'manager');
})

.factory('managers', function(Collection) {
    return (function() {

        var ManagersCollection = inheritCollection(function() {}, Collection);

        return new ManagersCollection;
    }());
})

.factory('Manager', function(Item) {
    var Manager = function () {};

    angular.extend(Manager.prototype, Item.prototype);

    return Manager;
})

.run(function(managers, Manager, managerApi) {
    managers._registerCollection('manager', 'managers', Manager, managerApi);
});