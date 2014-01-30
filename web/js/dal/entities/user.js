'use strict';

angular.module('app.dal.entities.user', ['app.dal.rest.user'])

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

    var errorHandler = function(response) {
        if (typeof response === 'string') {
            return $q.reject(response);                              // пришла строка с ошибкой из RESTapi.responseHandler
        } else {
            return $q.reject("Сервер вернул ошибку: " + error_code);     // пришел объект с ошибкой из RESTapi.errorHandler
        }
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
                return _.extend(new ItemConstructor(), i);
            };

        var self = this;
        return this.getRestApiProvider().query().then(function (response) {
            self.collection = _.collect(response, createItem);
            return self.collection;
        }, errorHandler);

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
            }, errorHandler);
        }
        return $q.when(this.collection);
    };

    /**
     * @param {Number} id
     * @returns {User}
     */

    Collection.prototype.getById = function(id) {
        return _.find(this.collection, {id: id});
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
                return _.extend(collection[idx], response);
            }, errorHandler);
        }
    };

    /**
     * @param {User} id
     * @returns {Promise}
     */

    Collection.prototype.save = function(user) {

        if (user.id) {      // пользователь не новый
            var collection = this.collection,
                idx = this.findIndex(user.id);

            if (-1 === idx) {
                return $q.reject("В коллекции не найден требуемый элемент: " + id);
            } else {
                return this.getRestApiProvider().update(user).then(function(response){
                    return _.extend(collection[idx], response);
                }, errorHandler);
            }

        } else {
            var collection = this.collection;
            return this.getRestApiProvider().create(user).then(function(response){
                collection.push(user);
                console.log(collection.length);
                return _.extend(user, response);
            }, errorHandler);

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
            }, errorHandler);
        }
    };

    return Collection;
})

.factory('users', function(Collection, UserApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(UserApi);

    return collection;
})

.factory('User', function(users) {
    var User = function () {};

    User.prototype.remove = function () {
        if (typeof this.id !== 'undefined') {
            var message = users.remove(this.id);
            if (message) {
                // здесь должна быть визуализация диалогового окна с полученным собщением и кнопкой "Осознал"
            }
        }
    }

    return User;
})

.run(function(users, User) {
    users.setItemConstructor(User);
});