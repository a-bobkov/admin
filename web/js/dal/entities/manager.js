'use strict';

angular.module('app.dal.entities.manager', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('managerApi', function(RestApi) {
   return new RestApi('managers', 'manager');
})

.factory('managers', function(Collection, managerApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(managerApi);
    collection.registerChild ('manager');

    return collection;
})

.factory('Manager', function(managers, Item) {
    var Manager = function () {};

    angular.extend(Manager.prototype, Item.prototype);

    return Manager;
})

.run(function(managers, Manager) {
    managers.setItemConstructor(Manager);
});