'use strict';

angular.module('max.dal.entities.collection', [])

.factory('Item', function() {

var Item = (function() {

    var Item = function(itemData) {
        var entityParams = this.entityParams;
        _.forOwn(itemData, function(value, key) {
            if (entityParams && _.contains(entityParams.dateFields, key)) {
                this[key] = (value === null) ? null : new Date(value);
            } else if (entityParams && _.has(entityParams.enumFields, key)) {
                this[key] = (value === null) ? null : entityParams.enumFields[key].get(value);
            } else if (entityParams && _.has(entityParams.objectFields, key)) {
                this[key] = new entityParams.objectFields[key](value);
            } else {
                this[key] = value;
            }
            if (this[key] === undefined) {
                throw new CollectionError('Неправильный формат значения в поле ' + key + ': ' +angular.toJson(itemData));
            }
        }, this);
        return this;
    };

    Item.prototype.resolveRefs = function(directories) {
        var entityParams = this.entityParams;
        var self = this;
        return _.forOwn(self, function(value, key) {
            var newValue;
            if (_.has(value, 'id')) {
                if (_.has(entityParams.enumFields, key)) {
                    return;
                } else if (_.has(entityParams.objectFields, key)) {
                    value.resolveRefs(directories);
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

    Item.prototype.serialize = function() {
        var entityParams = this.entityParams;
        var self = this;
        return _.mapValues(this, function(value, key) {
            if (entityParams && _.has(entityParams.enumFields, key)) {
                return (value === null) ? null : value.id;
            } else if (entityParams && _.has(entityParams.objectFields, key)) {
                return value.serialize();
            } else if (entityParams && _.has(entityParams.refFields, key) && value !== null) {
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

    var Collection = function(itemsData, queryParams, itemConstructor, collConstructor) {
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
        _.invoke(this.getItems(), 'resolveRefs', directories);
        return this;
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

.factory('Construction', function() {

    var Construction = function(collections) {
        _.assign(this, collections);
    }

    Construction.prototype.resolveRefs = function() {
        var self = this;
        return _.forEach(self, function(value) {
            if (value) {
                value.resolveRefs(self);
            }
        });
    };
    return Construction;
})

.service('entityLoader', function() {
    this.loadItems = function(queryParams, directories, entityApi, collConstructor) {
        return entityApi.query(queryParams).then(function(collectionData) {
            var collection = new collConstructor(collectionData[collConstructor.prototype.lowerName], collectionData.params);
            if (directories) {
                collection.resolveRefs(directories);
            }
            return collection;
        });
    };
    this.loadItem = function(id, directories, entityApi, itemConstructor) {
        return entityApi.get(id).then(function(itemData) {
            var item = new itemConstructor(itemData[itemConstructor.prototype.lowerName]);
            if (directories) {
                item.resolveRefs(directories);
            }
            return item;
        });
    };
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
