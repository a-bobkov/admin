'use strict';

angular.module('app.dal.entities.manager', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('managerApi', function(RestApi, Api) {
    var managerApi = new RestApi('managers', 'manager');
    return managerApi;
})

.factory('Manager', function() {

    var Manager = function(itemData, directories) {
        _.extend(this, itemData);
    };
    return Manager;
})

.factory('Managers', function() {
    
    var Managers = (function() {
        var Managers = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Managers;
    }());
    return Managers;
})

.factory('managersLoader', function(Manager, Managers) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Manager(itemData, directories);
        });
        return new Managers(items, queryParams);
    };
});