'use strict';

angular.module('app.dal.entities.collection', [])

.factory('Collection', function() {

var Collection = (function() {

    var Collection = function(queryItems, queryParams) {
        this.items = queryItems;
        this.params = queryParams;
    };

    Collection.prototype.getItems = function() {
        return this.items;
    };
    Collection.prototype.getParams = function() {
        return this.params;
    };
    Collection.prototype.get = function(id) {
        return _.find(Collection.prototype.getItems.call(this), {id: id});
    };
    Collection.prototype.serialize = function() {
        return _.invoke(Collection.prototype.getItems.call(this), this.serialize);
    };

    return Collection;
}());

return Collection;

})

.factory('Item', function() {

    var Item = function () {};

    Item.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (_.isObject(value) && (key !== 'phones')) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return Item;
});

var inherit = function(child, parent) {
    child.prototype = new parent;
    return child;
};

var CollectionError = function(message) {
    this.message = message || "Неопределенная ошибка";
    this.stack = (new Error()).stack;
    console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
