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

.factory('users', function(Collection, UserApi, UserOptions, $rootScope) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(UserApi);

    return collection;
})

.factory('User', function(users, UserOptions, $rootScope) {
    var User = function (data) {
        if (!UserOptions.data) {
            UserOptions.getOptions().then(function(respond) {
                UserOptions.data = respond;
            });
            $rootScope.$digest();
        }

        this.deserialize(data);
    };

    User.prototype.deserialize = function(data) {
        var key;

        for (key in data) {
            if (typeof data[key] === "object") {
                this[key] = data[key].id;
                // на самом деле здесь должен быть вызов конструктора объекта (data[key]) и сохранение ссылки на него
            } else if (typeof data[key] === "number") {
                this[key] = data[key];
            } else if (typeof data[key] === "string") {
                this[key] = data[key];
            }
        }
        // здесь обработка имеющихся серверных и клиентских справочников
        //this.tag_id = UserOptions.getbyId('manager',this.tag_id)


        // this.status = optionsStatus.getStatusById(this.status);
        // this.tag_id = optionsTag.getTagById(this.tag_id);
        // this.phone_from = optionsHour.getHourById(this.phone_from);
        // this.phone_to = optionsHour.getHourById(this.phone_to);
        // this.phone2_from = optionsHour.getHourById(this.phone2_from);
        // this.phone2_to = optionsHour.getHourById(this.phone2_to);
        // this.phone3_from = optionsHour.getHourById(this.phone3_from);
        // this.phone3_to = optionsHour.getHourById(this.phone3_to);
        return this;
    }

    User.prototype.serialize = function() {
        var key,
            data = {};

        for (key in this) {
            if (typeof this[key] === "object") {
                data[key] = this[key].id;
                //data[key] = this[key].serialize();          // на самом деле здесь должно быть так
            } else if (typeof this[key] === "number") {
                data[key] = this[key];
            } else if (typeof this[key] === "string") {
                data[key] = this[key];
            }
        }
        return data;
    }

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
})

.service('UserOptions', function($q, Api) {
    var responseHandler = function(response) {
        var data = response,
            errorMessage = '';

        for (var key in data) {
            if (key.search(/(\w+)List$/)) {
                errorMessage = errorMessage + '\nОтвет сервера содержит неправильное название секции: ' + key + ' (должно быть "(\\w+)List)"';
            }
            var section = data[key];
            if ({}.toString.call(section) !== '[object Array]') {
                errorMessage = errorMessage + '\nОтвет сервера не содержит массив в секции: ' + key;
            } else {
                for (var i=0; i < section.length; i++) {
                    var elem = section[i];
                    if (typeof elem.id === 'undefined') {
                        errorMessage = errorMessage + '\nОтвет сервера не содержит параметр id в секции: ' + key + ', элементе: ' + angular.toJson(elem);
                    } else {
                        for (var key2 in elem) {
                            var attr = elem[key2];
                            if (typeof attr === "object") {
                                if (typeof attr.id === 'undefined') {
                                    errorMessage = errorMessage + '\nОтвет сервера не содержит ссылочный id в секции: ' + key + ', элементе с id: ' + elem.id + ', параметре: ' + key2;
                                } else {
                                    var refSection = data[key2+'List'];
                                    var refElem = _.find(refSection, {id: attr.id})
                                    if (!refElem) {
                                        errorMessage = errorMessage + '\nОтвет сервера не содержит ссылочный элемент для секции: ' + key + ', элемента с id: ' + elem.id + ', параметра: ' + key2;
                                    } else {
                                        elem[key2] = refElem;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (errorMessage) {
            return $q.reject(errorMessage);
        }

        return data;
    };

    /**
     * @param -
     * @returns {Promise}
     */
    this.getOptions = function() {
        return Api.get('/api2/combined/users/').then(responseHandler);
    };

    this.getById = function(optionName, id) {
        var section = this.data[optionName+'List'];
        if (section) {
            for (var i=0; i<section.length; i++) {
                if (section[i].id == id) {
                    return section[i];
                }
            }
        return id;
        }
    }
});
