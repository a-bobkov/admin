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

    Collection.prototype.load = function() {
        var ItemConstructor = this.getItemConstructor(),
            createItem = function(i){
                if (typeof i.id ===  'undefined') {
                    throw new Error('Элемент коллекции ' + JSON.stringify(i) + ' не имеет параметра id.');
                }
                return _.extend(new ItemConstructor(), i);
            };
        this.collection = _.collect(this.getRestApiProvider().query(), createItem);
    };

    Collection.prototype.getAll = function() {
        if (!this.collection) {
            this.load();
        }
        return this.collection;
    };

    Collection.prototype.get = function(id) {
        return _.find(this.getAll(), {id: id});
    };

    var errorHandler = function(response) {
        if (typeof response === 'string') {
            return response;                     // пришла строка с ошибкой из RESTapi.responseHandler
        } else {
            return "Сервер вернул ошибку: " + error_code;     // пришел объект с ошибкой из RESTapi.errorHandler
        }
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */

    Collection.prototype.remove = function(id) {
        var collection = this.getAll(),
            idx = _.findIndex(collection, {id: id});

        if (-1 === idx) {
            return $q.reject("В памяти не найден требуемый элемент " + id);
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