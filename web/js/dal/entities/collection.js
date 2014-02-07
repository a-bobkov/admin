'use strict';

angular.module('app.dal.entities.collection', [])

.factory('Collection', function($q) {
    /**
     * Реализация базовой функциональности для работы с коллекциями объектов
     */
    var Collection = function () {};

    Collection.prototype.children = {};

    Collection.prototype.registerChild = function(entityName) {
        Collection.prototype.children[entityName] = this;
    };

    Collection.prototype.setItemConstructor = function(ItemConstructor) {
        this.ItemConstructor = ItemConstructor;
    };

    Collection.prototype.getItemConstructor = function() {
        if (typeof this.ItemConstructor === 'undefined') {
            throw new Error('Не задан конструктор для элементов коллекции.');
        }
        return this.ItemConstructor;
    };

    Collection.prototype.setRestApiProvider = function(restApiProvider) {
        //todo: проверки на наличии необходимых методов query, create, update, remove
        this.restApiProvider = restApiProvider;
    };

    Collection.prototype.getRestApiProvider = function() {
        if (typeof this.restApiProvider === 'undefined') {
            throw new Error('Не задан провайдер REST API.');
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
    Collection.prototype._addItem = function(itemData, errorMessages) {
        var item;

        if (typeof itemData.id === 'undefined') {
            errorMessages.push('Нет параметра id в элементе: ' + angular.toJson(itemData));
        } else {
            item = this._findItem(itemData.id);
            if (!item) {
                var ItemConstructor = this.getItemConstructor();
                item = new ItemConstructor();
                this.collection = this.collection || [];
                this.collection.push(item);
            }
            item._fillData(itemData, errorMessages);
        }
        return item;
    };

    /**
     * @param {Array}, {Array}
     * @returns {Array}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._addArray = function(itemsData, errorMessages) {
        var newArray = [];

        if (!angular.isArray(itemsData)) {
            errorMessages.push('Отсутствует массив');
        } else {
            for (var i = 0, length = itemsData.length; i < length; i++) {
                newArray[i] = this._addItem(itemsData[i], errorMessages);
            }
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
            var errorMessages = [];
            var newArray = self._addArray.call(self, itemsData, errorMessages);
            if (errorMessages.length) {
                return $q.reject(errorMessages);
            } else {
                return newArray;
            }
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
            if (item) {
                return item;
            } else {
                return $q.reject("В коллекции не найден элемент с id: " + id);
            }
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
                return item._fillData(itemData);
            });
        } else {
            return this.getRestApiProvider().create(item._serialize()).then(function(itemData){
                item._fillData(itemData);
                self.collection.push(item);
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
    Item.prototype._fillData = function(itemData, errorMessages) {
        for (var key in itemData) {
            var attr = itemData[key],
                refElem = attr;
            if (typeof attr === 'object') {
                if (typeof attr.id === 'undefined') {
                    errorMessages.push ('Нет ссылочного id в элементе с id: ' + itemData.id + ', параметре: ' + key);
                } else {
                    var collection = Collection.prototype.children[key];
                    if (collection) {
                        refElem = collection._addItem(attr, errorMessages);
                    } else {
                        errorMessages.push ('Неизвестный ссылочный параметр' + key + ' в элементе с id: ' + itemData.id);
                    }
                }
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
