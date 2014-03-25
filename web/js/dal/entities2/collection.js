'use strict';

angular.module('app.dal.entities.collection', [])

.factory('Collection', function() {
    /**
     * Реализация базовой функциональности для работы с коллекциями объектов
     */
var Collection = (function() {
    var items;
    var params;

    var Collection = function() {};
    Collection.prototype.construct = function(itemsData, queryParams, itemConstructor) {
        items = _.collect(itemsData, function(itemData) {
            return new itemConstructor(itemData);
        });
        params = queryParams;   // todo: может быть, нужно делать глубокое копирование или new?
    };
    Collection.prototype.getItems = function() {
        return items;
    };
    Collection.prototype.getParams = function() {
        return params;
    };
    Collection.prototype.get = function(id) {
        return _.find(items, {id: id};
    };

    return Collection;
}());

return Collection;

})

var inheritCollection = function(child) {
    child.prototype = new Collection();
    return child;
};