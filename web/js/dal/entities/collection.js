'use strict';

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
    var Collection = function () {};

    Collection.prototype.children = {};

    Collection.prototype.registerChild = function(entityName, collectionName) {
        Collection.prototype.children[entityName] = this;
        Collection.prototype.children[collectionName] = this;
    };

    Collection.prototype.setItemConstructor = function(ItemConstructor) {
        this.ItemConstructor = ItemConstructor;
    };

    Collection.prototype.getItemConstructor = function() {
        if (typeof this.ItemConstructor === 'undefined') {
            throw new CollectionError('Не задан конструктор для элементов коллекции.');
        }
        return this.ItemConstructor;
    };

    Collection.prototype.setRestApiProvider = function(restApiProvider) {
        //todo: проверки на наличии необходимых методов query, create, update, remove
        this.restApiProvider = restApiProvider;
    };

    Collection.prototype.getRestApiProvider = function() {
        if (typeof this.restApiProvider === 'undefined') {
            throw new CollectionError('Не задан провайдер REST API.');
        }
        return this.restApiProvider;
    };

    /**
     * @param {Number} id
     * @returns {Item} OR undefined
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._findItem = function(id) {
        return _.find(this.collection, {id: id});
    };

    /**
     * @param {Object}, {Array}
     * @returns {Object}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._addItem = function(itemData) {
        var item;

        if (typeof itemData.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(itemData));
        }
        item = this._findItem(itemData.id);
        if (!item) {
            var ItemConstructor = this.getItemConstructor();
            item = new ItemConstructor();
            this.collection = this.collection || [];
            this.collection.push(item);
        }
        item._fillData(itemData);
        return item;
    };

    /**
     * @param {Array}, {Array}
     * @returns {Array}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._addArray = function(itemsData) {
        var newArray = [];

        if (!angular.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив');
        }
        for (var i = 0, length = itemsData.length; i < length; i++) {
            newArray[i] = this._addItem(itemsData[i]);
        }
        return newArray;
    };

    /**
     * @param {Number} id
     * @returns {Number}
     */
    Collection.prototype._findIndex = function(id) {
        return _.findIndex(this.collection, {id: id});
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
                    newArray = self._addArray.call(self, itemsData);
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
        if (!this.collection) {
            var self = this;
            return this.load().then(function (response) {
                return self.collection;
            });
        }
        return $q.when(this.collection);
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
                    self.collection.push(item);
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
            self.collection.splice(self._findIndex(id), 1);
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
                    var collection = Collection.prototype.children[key];
                    if (!collection) {
                        throw new CollectionError('Неизвестная секция: ' + key);
                    }
                    dataProcessed[key] = collection._addArray(optionsData[key]);
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
})

.factory('Item', function(Collection) {
    var Item = function () {};

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
                var collection = Collection.prototype.children[key];
                if (!collection) {
                    throw new CollectionError('Неизвестный ссылочный параметр' + key + ' в элементе с id: ' + itemData.id);
                }
                refElem = collection._addItem(attr);
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
