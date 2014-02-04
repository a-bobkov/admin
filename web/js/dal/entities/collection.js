'use strict';

angular.module('app.dal.entities.collection', ['app.dal.entities.city', 'app.dal.entities.dealer'])

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
     * @param {Object}, {Array}, {Object}
     * @returns {Object}
     */
    Collection.prototype.addItem = function(itemData, errorMessages, obj) {
        var item;
        obj = obj || this;

        if (typeof itemData.id === 'undefined') {
            errorMessages.push('Нет параметра id в элементе: ' + angular.toJson(itemData));
        } else {
            item = obj.getById(itemData.id);
            if (typeof item !== "object") {     // элемент ранее не создавался
                var ItemConstructor = obj.getItemConstructor();
                item = new ItemConstructor();
                if (!obj.collection) {
                    obj.collection = [];
                }
                obj.collection.push (item);
            }
            item.fillData(itemData, errorMessages);
        }
        return item;
    };

    /**
     * @param {Array}, {Array}, {Object}
     * @returns {Array}
     */
    Collection.prototype.addArray = function(itemsData, errorMessages, obj) {
        var newArray = [];
        errorMessages = errorMessages || [];
        obj = obj || this;

        if ({}.toString.call(itemsData) !== '[object Array]') {
            errorMessages.push('Отсутствует массив');
        } else {
            for (var i=0; i < itemsData.length; i++) {
                newArray [i] = obj.addItem(itemsData[i], errorMessages, obj);
            }
        }
        return newArray;
    };

    /**
     * @param {Array}
     * @returns {Promise}
     */
    Collection.prototype.load = function(errorMessages) {
        var self = this,
            createItems = function(itemsData){
                return self.addArray(itemsData, errorMessages, self);
            };
        return this.getRestApiProvider().query().then(createItems);
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
     * @returns {Item} OR {Number}
     */
    Collection.prototype.getById = function(id) {
        var item = _.find(this.collection, {id: id});
        if (item) {
            return item;
        } else {
            return id;
        }
    };

    /**
     * @param {Number} id
     * @returns {Number}
     */
    Collection.prototype.findIndex = function(id) {
        return _.findIndex(this.collection, {id: id});
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.get = function(id) {
        var collection = this.collection,
            idx = this.findIndex(id);

        if (-1 === idx) {
            return $q.reject("В коллекции не найден требуемый элемент: " + id);
        } else {
            return this.getRestApiProvider().get(id).then(function(response){
                return collection[idx].fillData(response);
            });
        }
    };

    /**
     * @param {Item} id
     * @returns {Promise}
     */
    Collection.prototype.save = function(item) {

        if (item.id) {      // элемент должен быть в коллекции
            var collection = this.collection,
                idx = this.findIndex(item.id);

            if (-1 === idx) {
                return $q.reject("В коллекции не найден требуемый элемент: " + item.id);
            } else {
                return this.getRestApiProvider().update(item.serialize()).then(function(response){
                    return collection[idx].fillData(response);
                });
            }

        } else {
            var collection = this.collection;
            return this.getRestApiProvider().create(item.serialize()).then(function(response){
                item.fillData(response);
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
            idx = this.findIndex(id);

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

.factory('Item', function(cities, dealers) {

    var Item = function () {};

    /**
     * @param {Object}
     * @returns {Object}
     */
    Item.prototype.fillData = function(itemData, errorMessages) {
        for (var key in itemData) {
            var attr = itemData[key],
                refElem = attr;

            if (typeof attr === 'object') {
                if (typeof attr.id === 'undefined') {
                    errorMessages.push ('Нет ссылочного id в элементе с id: ' + itemData.id + ', параметре: ' + key);
                } else {
                    switch (key) {  // здесь нужно сделать проверки на все справочники, на которые бывает ссылка
                    case 'city':
                        refElem = cities.getById (attr.id);
                        if (typeof refElem !== "object") {
                            var ItemConstructor = cities.getItemConstructor();
                            refElem = new ItemConstructor();
                        }
                        refElem.fillData(attr);
                        break;
                    case 'dealer':
                        refElem = dealers.getById (attr.id);
                        if (typeof refElem !== "object") {
                            var ItemConstructor = dealers.getItemConstructor();
                            refElem = new ItemConstructor();
                        }
                        refElem.fillData(attr);
                        break;
                    default:
                        errorMessages.push ('Неизвестный ссылочный параметр' + key + ' в элементе с id: ' + itemData.id);
                    }
                }
            }
            this[key] = refElem;
        }
        return this;
    };

    Item.prototype.serialize = function() {
        var key,
            itemData = {};

        for (key in this) {
            if (typeof this[key] === "object") {
                if (key === "dealer") {
                    itemData[key] = this[key].serialize();
                } else {
                    itemData[key] = this[key].id;
                }
            } else {
                itemData[key] = this[key];
            }
        }

        return itemData;
    };

    Item.prototype.remove = function () {
        if (typeof this.id !== 'undefined') {
            var message = users.remove(this.id);
            if (message) {
                // здесь должна быть визуализация диалогового окна с полученным собщением и кнопкой "Осознал"
            }
        }
    }

    return Item;
});
