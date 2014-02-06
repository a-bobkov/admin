'use strict';

angular.module('app.dal.entities.collection', [
    'app.dal.entities.city',
    'app.dal.entities.dealer',
    'app.dal.entities.group',
    'app.dal.entities.manager',
    'app.dal.entities.market',
    'app.dal.entities.metro',
    'app.dal.entities.site'
])

.factory('Collection', function($q) {
    /**
     * Реализация базовой функциональности для работы с коллекциями объектов
     */
    var Collection = function () {};

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
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._findItem = function(id) {
        return _.find(this.collection, {id: id});
    };

    /**
     * @param {Object}, {Array}, {Object}
     * @returns {Object}
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
                this.collection.push (item);
            }
            item._fillData(itemData, errorMessages);
        }
        return item;
    };

    /**
     * @param {Array}, {Array}, {Object}
     * @returns {Array}
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Collection.prototype._addArray = function(itemsData, errorMessages) {
        var newArray = [];

        if ({}.toString.call(itemsData) !== '[object Array]') {
            errorMessages.push('Отсутствует массив');
        } else {
            for (var i=0; i < itemsData.length; i++) {
                newArray [i] = this._addItem(itemsData[i], errorMessages);
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
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.getUser = function(id) {   // этот метод надо сделать методом users.get (перекрытие)
        var self = this;
        return Collection.prototype.get.call(this, id).then(function (item) {
            return self.getRestApiProvider().get(id).then(function(itemData){
                return item._fillData(itemData);
            });
        })
    };

    /**
     * @param {Item} id
     * @returns {Promise}
     */
    Collection.prototype.save = function(item) {

        if (item.id) {      // элемент должен быть в коллекции
            var collection = this.collection,
                idx = this._findIndex(item.id);

            if (-1 === idx) {
                return $q.reject("В коллекции не найден требуемый элемент: " + item.id);
            } else {
                return this.getRestApiProvider().update(item._serialize()).then(function(response){
                    return collection[idx]._fillData(response);
                });
            }

        } else {
            var collection = this.collection;
            return this.getRestApiProvider().create(item._serialize()).then(function(response){
                item._fillData(response);
                collection.push(item);
                return item;
            });
        }
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.remove = function(id) {
        var collection = this.collection,
            idx = this._findIndex(id);

        if (-1 === idx) {
            return $q.reject("В коллекции не найден требуемый элемент: " + id);
        } else {
            return this.getRestApiProvider().remove(id).then(function(response){
                collection.splice(idx, 1);
            });
        }
    };

    return Collection;
})

.factory('Item', function(cities, dealers, groups, managers, markets, metros, sites) {

    var Item = function () {};

    /**
     * @param {Object}
     * @returns {Object}
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
                    var collection;
                    switch (key) {  // здесь должны проверяться все справочники, на которые бывают ссылки
                    case 'city':
                        collection = cities;
                        break;
                    case 'dealer':
                        collection = dealers;
                        break;
                    case 'group':
                        collection = groups;
                        break;
                    case 'manager':
                        collection = managers;
                        break;
                    case 'market':
                        collection = markets;
                        break;
                    case 'metro':
                        collection = metros;
                        break;
                    case 'site':
                        collection = sites;
                        break;
                    default:
                        errorMessages.push ('Неизвестный ссылочный параметр' + key + ' в элементе с id: ' + itemData.id);
                    }
                    if (collection) {
                        refElem = collection._addItem(attr, errorMessages);
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
