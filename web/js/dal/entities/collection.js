'use strict';

angular.module('max.dal.entities.collection', [])

.factory('Item', function() {

var Item = (function() {

    var Item = function(itemData, entityParams) {
        _.forOwn(itemData, function(value, key) {
            if (entityParams && _.contains(entityParams.dateFields, key)) {
                this[key] = new Date(value);
                this[key].setHours(0, 0, 0, 0);
            } else if (entityParams && _.has(entityParams.enumFields, key)) {
                this[key] = entityParams.enumFields[key].get(value);
            } else if (entityParams && _.has(entityParams.objectFields, key)) {
                this[key] = new entityParams.objectFields[key](value);
            } else {
                this[key] = value;
            }
            if (this[key] === undefined) {
                throw new CollectionError('Неправильный формат значения в поле ' + key + ': ' +angular.toJson(value));
            }
        }, this);
        return this;
    };

    Item.prototype.resolveRefs = function(directories, entityParams) {
        var self = this;
        return _.forOwn(this, function(value, key) {
            var newValue;
            if (_.has(value, 'id')) {
                if (_.has(entityParams.enumFields, key) || _.has(entityParams.objectFields, key)) {
                    return;
                } else if (_.has(entityParams.refFields, key)) {
                    newValue = directories[entityParams.refFields[key]].get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
                self[key] = newValue;
            }
        });
    };

    Item.prototype.serialize = function(entityParams) {
        return _.mapValues(this, function(value, key) {
            if (entityParams && _.has(entityParams.enumFields, key)) {
                return value.id;
            } else if (entityParams && _.has(entityParams.objectFields, key)) {
                return value.serialize();
            } else if (entityParams && _.has(entityParams.refFields, key)) {
                return {id: value.id};
            } else if (entityParams && _.contains(entityParams.dateFields, key)) {
                return value.toISOString().slice(0, 10);
            } else {
                return value;
            }
        });
    };

    Item.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (_.has(value, 'id')) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };
    return Item;
}());
return Item;
})

.factory('Collection', function() {

var Collection = (function() {

    var Collection = function(itemsData, itemConstructor, queryParams) {
        this.items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new itemConstructor(itemData);
        });
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
    Collection.prototype.resolveRefs = function(directories) {
        return _.invoke(this.getItems(), 'resolveRefs', directories);
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

var CollectionError = function(message, response) {
    this.message = message || "Неопределенная ошибка";
    this.stack = (new Error()).stack;
    if (response) {
        this.response = response;
    }
    console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
