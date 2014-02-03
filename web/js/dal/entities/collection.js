'use strict';

angular.module('app.dal.entities.collection', [])

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
     * @param -
     * @returns {Promise}
     */

    Collection.prototype.load = function() {
        var ItemConstructor = this.getItemConstructor(),
            createItem = function(i){
                if (typeof i.id ===  'undefined') {
                    throw new Error('Элемент коллекции ' + JSON.stringify(i) + ' не имеет параметра id.');
                }
                return new ItemConstructor(i);
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
});
