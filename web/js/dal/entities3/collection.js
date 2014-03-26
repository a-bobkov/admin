'use strict';

angular.module('app.dal.entities.collection', [])

.factory('Collection', function() {

var Collection = (function() {
    var items;
    var params;

    var Collection = function() {};
    Collection.prototype.construct = function(queryItems, queryParams) {
        items = queryItems;
        params = queryParams;   // todo: может быть, нужно делать глубокое копирование или new?
    };
    Collection.prototype.getItems = function() {
        return items;
    };
    Collection.prototype.getParams = function() {
        return params;
    };
    Collection.prototype.get = function(id) {
        return _.find(items, {id: id});
    };

    return Collection;
}());

return Collection;

});

var inheritCollection = function(child) {
    child.prototype = new Collection();
    return child;
};

var CollectionError = function(message) {
    this.message = message || "Неопределенная ошибка";
    this.stack = (new Error()).stack;
    // console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
