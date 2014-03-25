'use strict';

angular.module('app.dal.entities.manager', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('managerApi', function(RestApi, Api) {
    var managerApi = new RestApi('managers', 'manager');
    return managerApi;
})

.factory('Manager', function() {
    var Manager = function(itemData) {
        angular.extend(this, itemData);
    };
    return Manager;
})

.factory('Managers', function(Manager) {
    var Managers = (function() {
        var Managers = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams, Manager);
        });
        return Managers;
    }());
    return Managers;
})

.factory('managersLoader', function(managerApi, Managers, Manager) {
    this.makeItem = function() {
        return _.assign({}, this);
    });

    this.makeCollection = function(itemsData, queryParams) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem);
        return new Managers(newItemsData, queryParams);
    };
});