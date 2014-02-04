'use strict';

angular.module('app.dal.entities.collection', ['app.dal.entities.city'])

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
     * @param {Object}
     * @returns {Object} OR {String}
     */
    Collection.prototype.addElem = function(elem) {
        var errorMessage = '',
            newElem;

        if (typeof elem.id === 'undefined') {
            errorMessage = errorMessage + '\nНет параметра id в элементе: ' + angular.toJson(elem);
        } else {
            newElem = this.getById(elem.id);
            if (!newElem) {     // элемент ранее не создавался
                newElem = this.getItemConstructor({id: elem.id});
            }
            for (var key in elem) {
                var attr = elem[key],
                    refElem = attr;

                if (typeof attr === 'object') {
                    if (typeof attr.id === 'undefined') {
                        errorMessage = errorMessage + '\nНет ссылочного id в элементе с id: ' + elem.id + ', параметре: ' + key;
                    } else {
                        if (key === 'city') { // здесь нужно сделать проверки на все справочники
                            refElem = cities.getById (attr.id);
                            if (!refElem) {
                                refElem = new cities.getItemConstructor({id: attr.id})
                            }
                        } else {
                            errorMessage = errorMessage + '\nНеизвестный ссылочный параметр' + key + ' в элементе с id: ' + elem.id;
                        }
                    }
                }
                newElem[key] = refElem;
            }
        }

        if (errorMessage) {
            return (errorMessage);
        }

        return data;
    };

    /**
     * @param {Array}
     * @returns {Object} OR {String}
     */
    Collection.prototype.addArray = function(section) {
        var errorMessage = '';

        if ({}.toString.call(section) !== '[object Array]') {
            errorMessage = errorMessage + '\nОтсутствует массив';
            errorMessage = errorMessage + this.addElem(section);
        } else {
            for (var i=0; i < section.length; i++) {
                errorMessage = errorMessage + this.addElem(section[i]);
            }
        }

        if (errorMessage) {
            return ('\nОшибки в секции: ' + errorMessage);  // Вставить здесь название справочника this
        }

        return data;
    };

    Collection.prototype.responseHandlerOptions = function(response) {
        var data = response,
            errorMessage = '';

        for (var key in data) {
            if (key === "cities") {     // здесь должны проверяться все секции, которые могут встретиться
                errorMessage = errorMessage + cities.addArray(data[key]);
            } else {
                errorMessage = errorMessage + '\nНеизвестная секция: ' + key;
            }
        }

        if (errorMessage) {
            return $q.reject('Ответ сервера содержит ошибки:' + errorMessage);
        }

        return data;
    };

    Collection.prototype.load = function() {
        var ItemConstructor = this.getItemConstructor(),
            createItem = function(i){
                if (typeof i.id ===  'undefined') {
                    throw new Error('Элемент коллекции ' + JSON.stringify(i) + ' не имеет параметра id.');
                }
                return (new ItemConstructor()).deserialize(i);
            };

        var self = this;
        return this.getRestApiProvider().query().then(function (response) {
            self.collection = _.collect(response, createItem);
            return self.collection;
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
                return collection[idx].deserialize(response);
            });
        }
    };

    /**
     * @param {User} id
     * @returns {Promise}
     */

    Collection.prototype.save = function(user) {

        if (user.id) {      // пользователь должен быть в коллекции
            var collection = this.collection,
                idx = this.findIndex(user.id);

            if (-1 === idx) {
                return $q.reject("В коллекции не найден требуемый элемент: " + user.id);
            } else {
                return this.getRestApiProvider().update(user.serialize()).then(function(response){
                    return collection[idx].deserialize(response);
                });
            }

        } else {
            var collection = this.collection;
            return this.getRestApiProvider().create(user.serialize()).then(function(response){
                user.deserialize(response);
                collection.push(user);
                return user;
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

.factory('Item', function() {

    var Item = function () {
    };

    Item.prototype.deserialize = function(itemData) {
        var key;

        for (key in itemData) {
            if (typeof itemData[key] === "object") {
                this[key] = itemData[key].id;
                // для ссылочной целостности, здесь должен быть либо:
                // 1. если в объекте - только id, то поиск ранее созданного объекта и сохранение ссылки на него
                //    если объекта еще нет, то можно здесь создать пустой, а когда он будет создаваться - наполнить
                // 2. иначе - вызов конструктора объекта (data[key]) и сохранение ссылки на него
            } else {
                this[key] = itemData[key];
            }
        }

        return this;
    };

    Item.prototype.serialize = function() {
        var key,
            itemData = {};

        for (key in this) {
            if (typeof this[key] === "object") {
                itemData[key] = this[key].id;
                //data[key] = this[key].serialize();        // исключение! для дилера здесь должно быть так
            } else {
                itemData[key] = this[key];
            }
        }

        return itemData;
    };

    return Item;
});
