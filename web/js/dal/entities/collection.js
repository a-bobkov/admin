'use strict';

var inherit = function(child, parent) {
    child.prototype = new parent;
    return child;
};

function CollectionError(message) {
    this.message = message || "Неопределенная ошибка";
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;

angular.module('app.dal.entities.collection', [])

.factory('Collection', function($q, $log) {
    /**
     * Реализация базовой функциональности для работы с коллекциями объектов
     */
var Collection = (function() {
    var _collection = [];

    var _findCollectionByEntity = function(entity) {
        var collection = _.find(_collection, function(collection) {
            return collection.entity === entity;
        });
        if (!collection) {
            throw new CollectionError('Не зарегистрирована коллекция для объекта: '+ angular.toJson(entity));
        }
        return collection;
    };

    var _getItems = function(entity) {
        return _findCollectionByEntity(entity).items;
    };

    var _getItemConstructor = function(entity) {
        var itemConstructor = _findCollectionByEntity(entity).itemConstructor;
        if (typeof itemConstructor === 'undefined') {
            throw new CollectionError('Не задан конструктор элементов коллекции.');
        }
        return itemConstructor;
    };

    var Collection = function() {};

    Collection.prototype.registerCollection = function(entityName, collectionName, itemConstructor, restApiProvider) {
        _collection.push({
            entity: this,
            entityName: entityName,
            collectionName: collectionName,
            restApiProvider: restApiProvider,
        //todo: проверки на наличии необходимых методов query, create, update, remove
            itemConstructor: itemConstructor,
            items: []
        });
    };

    Collection.prototype.findEntityByName = function(name) {
        var collection = _.find(_collection, function(collection) {
            return (collection.entityName === name) || (collection.collectionName === name);
        });
        if (!collection) {
            throw new CollectionError('Не зарегистрирована коллекция с именем: '+ name);
        }
        return collection.entity;
    };

    Collection.prototype.getRestApiProvider = function() {
        var restApiProvider = _findCollectionByEntity(this).restApiProvider;
        if (typeof restApiProvider === 'undefined') {
            throw new CollectionError('Не задан провайдер REST API для коллекции.');
        }
        return restApiProvider;
    };

    /**
     * @param {Number} id
     * @returns {Item} OR undefined
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var _findItem = function(id) {
        return _.find(_getItems(this), {id: id});
    };

    /**
     * @param {Object}, {Array}
     * @returns {Object}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var _addItem = function(itemData) {
        var item;

        if (typeof itemData.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(itemData));
        }
        item = _findItem.call(this, itemData.id);
        if (!item) {
            var ItemConstructor = _getItemConstructor(this);
            item = new ItemConstructor();
            _getItems(this).push(item);
        }
        item._fillData(itemData);
        return item;
    };

    Collection.prototype.addItem = _addItem;     // передача частного метода для дружественного Item

    /**
     * @param {Array}, {Array}
     * @returns {Array}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var _addArray = function(itemsData) {
        var newArray = [];

        if (!angular.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив');
        }
        for (var i = 0, length = itemsData.length; i < length; i++) {
            newArray[i] = _addItem.call(this, itemsData[i]);
        }
        return newArray;
    };

    /**
     * @param {Number} id
     * @returns {Number}
     */
    var _findIndex = function(id) {
        return _.findIndex(_getItems(this), {id: id});
    };
    
    /**
     * @param {Array}
     * @returns {Promise}
     */
    Collection.prototype.load = function() {
        var self = this;
        return this.getRestApiProvider().query().then(function(itemsData){
            try {
                var errorMessages = [],
                    newArray = _addArray.call(self, itemsData);
            } catch (error) {
                if (!(error instanceof CollectionError)) {
                    throw error;
                }
                errorMessages.push(error.message);
            }
            if (errorMessages.length) {
                $log.error(errorMessages);
                return $q.reject({response: itemsData, errorMessage: errorMessages});
            }
            return newArray;
        });
    };

    /**
     * @param -
     * @returns {Promise}
     */
    Collection.prototype.getAll = function() {
        if (0 === _getItems(this).length) {
            var self = this;
            return this.load().then(function (response) {
                return _getItems(self);
            });
        }
        return $q.when(_getItems(this));
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.get = function(id) {
        return this.getAll().then(function (response) {
            var item = _.find(response, {id: id});
            if (!item) {
                var errorMessage = "В коллекции не найден элемент с id: " + id;
                $log.error(errorMessage);
                return $q.reject({response: response, errorMessage: errorMessage});
            }
            return item;
        })
    };

    /**
     * @param {Item} id
     * @returns {Promise}
     */
    Collection.prototype.save = function(item) {
        var self = this;
        if (item.id) {      // элемент должен быть в коллекции
            return this.getRestApiProvider().update(item._serialize()).then(function(itemData){
                try {
                    var errorMessages = [];
                    item._fillData(itemData);
                } catch (error) {
                    if (!(error instanceof CollectionError)) {
                        throw error;
                    }
                    errorMessages.push(error.message);
                }
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: item, errorMessage: errorMessages});
                }
                return item;
            });
        } else {        // todo: сделать вызов _addItem
            return this.getRestApiProvider().create(item._serialize()).then(function(itemData){
                try {
                    var errorMessages = [];
                    item._fillData(itemData);
                    _getItems(self).push(item);
                } catch (error) {
                    if (!(error instanceof CollectionError)) {
                        throw error;
                    }
                    errorMessages.push(error.message);
                }
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: item, errorMessage: errorMessages});
                }
                return item;
            });
        }
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.remove = function(id) {
        var self = this;
        return this.getRestApiProvider().remove(id).then(function(itemData){
            _getItems(self).splice(_findIndex.call(self, id), 1);
        });
    };

    /**
     * @param -
     * @returns {Promise}
     */
    Collection.prototype.getDirectories = function() {
        var getDirectories = this.getRestApiProvider().getDirectories;
        if (!getDirectories) {
            throw new CollectionError('Не определен метод REST API для загрузки зависимых справочников коллекции.');
        }
        return getDirectories().then(function(optionsData){
            var dataProcessed = {},
                errorMessages = [];

            for (var key in optionsData) {
                try {
                    var collection = Collection.prototype.findEntityByName(key);
                    if (!collection) {
                        throw new CollectionError('Неизвестная секция: ' + key);
                    }
                    dataProcessed[key] = _addArray.call(collection, optionsData[key]);
                } catch (error) {
                    if (!(error instanceof CollectionError)) {
                        throw error;
                    }
                    errorMessages.push(error.message);
                }
            }

            if (errorMessages.length) {
                $log.error(errorMessages);
                return $q.reject({response: optionsData, errorMessage: errorMessages});
            }

            return dataProcessed;
        })
    };

    return Collection;
}());

return Collection;

})

.factory('Item', function(Collection) {
    var Item = function () {};

    var _addItem = Collection.prototype.addItem;         // забираем нужную функцию
    delete Collection.prototype.addItem;                 // и заметаем следы

    /**
     * @param {Object}
     * @returns {Object}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Item.prototype._fillData = function(itemData) {     // todo: собирать ошибки в массив и кидать его один раз
        for (var key in itemData) {
            var attr = itemData[key],
                refElem = attr;
            if (typeof attr === 'object') {
                if (typeof attr.id === 'undefined') {
                    throw new CollectionError('Нет ссылочного id в элементе с id: ' + itemData.id + ', параметре: ' + key);
                }
                var collection = Collection.prototype.findEntityByName(key);
                if (!collection) {
                    throw new CollectionError('Неизвестный ссылочный параметр' + key + ' в элементе с id: ' + itemData.id);
                }
                refElem = _addItem.call(collection, attr);
            }
            this[key] = refElem;
        }
        return this;
    };

    /**
     * @param {Object}
     * @returns {Object}
     * @description
     * метод для подготовки запроса на сервер, вызывается синхронно
     */
    Item.prototype._serialize = function() {
        var key,
            itemData = {};

        for (key in this) {
            if (typeof this[key] === "object") {
                if (key === "dealer") {               // todo: перекрытием данного метода на User
                    itemData[key] = this[key]._serialize();
                } else {
                    itemData[key] = this[key].id;
                }
            } else {
                itemData[key] = this[key];
            }
        }

        return itemData;
    };

    return Item;
});
