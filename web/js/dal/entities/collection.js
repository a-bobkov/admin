'use strict';

angular.module('max.dal.entities.collection', [])

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
        return _.invoke(Collection.prototype.getItems.call(this), function() {
            return this.serialize();
        });
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
            if (_.isObject(value)) {
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

var CollectionError = function(message, response) {
    this.message = message || "Неопределенная ошибка";
    this.stack = (new Error()).stack;
    if (response) {
        this.response = response;
    }
    // console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
