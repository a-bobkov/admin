'use strict';

angular.module('app.dal.entities.user', ['app.dal.entities.collection', 'app.dal.rest.api',
    'app.dal.entities.group',
    'app.dal.entities.status',
    'app.dal.entities.dealer',
    'app.dal.entities.site',
    'app.dal.entities.manager',
    'app.dal.entities.city',
    'app.dal.entities.market',
    'app.dal.entities.metro'
])

.factory('userApi', function(RestApi, Api) {

    var userApi = new RestApi('users', 'user');

    userApi.getDirectories = function() {
        return Api.get('/combined/users');
    };

    userApi.query = function() {
        return Api.get('/users/partial').then(
            this._getResponseHandler('users')
        );
    };

    return userApi;
})

.factory('User', function() {

    var User = function(itemData) {
        angular.extend(this, itemData);
    };

    User.prototype.isDealer = function() {
        return (this.group && this.group.id == 2);
    };

    User.prototype.isSite = function() {
        return (this.group && this.group.id == 3);
    };

    return User;
})

.factory('Users', function(User) {
    var Users = (function() {
        var Users = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams, User);
        });
        return Users;
    }());
    return Users;
})

.factory('usersLoader', function(userApi, Users, User, Dealer, statusesLoader, groupsLoader, dealersLoader, sitesLoader, managersLoader, citiesLoader, marketsLoader, metrosLoader) {

    /*
    Метод проверки и обработки данных справочника, полученных от дата-провайдера
    Входы:
        this - объект, полученный от дата-провайдера
        directories - Массив коллекций, по которым разрешаются ссылки
    Выходы:
        Элемент со ссылками, разрешенными по переданным коллекциям
    Необходимые зависимости:
        Нет
    */
    this.makeItem = function(directories) {
        if (typeof this.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(this));
        }
        return _.mapValues(this, function(value, key) {
            var newItem = value;
            if (value.id) {    // ссылка
                if (key === 'city') {
                    newItem = directories.cities.get(id);
                } else if (key === 'group') {
                    newItem = directories.groups.get(id);
                } else if (key === 'manager') {
                    newItem = directories.managers.get(id);
                } else if (key === 'market') {
                    newItem = directories.markets.get(id);
                } else if (key === 'metro') {
                    newItem = directories.metros.get(id);
                } else if (key === 'site') {
                    newItem = directories.sites.get(id);
                } else if (key === 'status') {
                    newItem = directories.statuses.get(id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newItem) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                // здесь можно реализовать дополнительную проверку и конвертацию данных айтема
            }

            return newItem;
        });
    };

    /*
    Метод проверки и обработки данных справочника, полученных от дата-провайдера
    Входы:
        Массив данных, полученных от дата-провайдера
        Параметры запроса, полученные от дата-провайдера
        Массив коллекций, по которым разрешаются ссылки
    Выходы:
        Коллекция со ссылками, разрешенными по переданным коллекциям
    Необходимые зависимости:
        Нет
    */
    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem, directories);

        return new Users(newItemsData, queryParams);
    };

    /*
    Метод загрузки дополнительных справочников
    Входы:
        Нет
    Выходы:
        Промис: объект, свойства которого - коллекции со ссылками, разрешенными по предыдущим коллекциям
    Необходимые зависимости:
        Дата-провайдер, который выдает данные справочников
        Загрузчики справочников, которые могут встретиться в ответе
    */
    var loadDirectories = function() {
        return userApi.getDirectories().then(function(directoriesData) {
            var directories = {};
            _.forOwn(directoriesData, function(itemsData, key) {
                if (key === 'cities') {
                    directories[key] = citiesLoader.makeCollection(itemsData, directories);
                } else if (key === 'groups') {
                    directories[key] = groupsLoader.makeCollection(itemsData, directories);
                } else if (key === 'managers') {
                    directories[key] = managersLoader.makeCollection(itemsData, directories);
                } else if (key === 'markets') {
                    directories[key] = marketsLoader.makeCollection(itemsData, directories);
                } else if (key === 'metros') {
                    directories[key] = metrosLoader.makeCollection(itemsData, directories);
                } else if (key === 'sites') {
                    directories[key] = sitesLoader.makeCollection(itemsData, directories);
                } else if (key === 'statuses') {
                    directories[key] = statusesLoader.makeCollection(itemsData, directories);
                }
            });

            return directories;
        });
    };

    /*
    Выборка вложенных дилеров
    Входы:
        Массив пользователей
    Выходы:
        Массив дилеров
    Необходимые зависимости:
        Нет
    */
    var takeDealers = function(itemsData) {
        var dealers = [];
        _.forEach(itemsData, function(itemData) {
            if (itemData.dealer) {
                dealers.push(itemData.dealer);
            }
        });

        return dealers;
    };

    /*
    Метод загрузки справочника с дополнительными справочниками
    Входы:
        Параметры запроса данных
    Выходы:
        Промис: объект, свойства которого - коллекции с разрешенными ссылками
    Необходимые зависимости:
        Дата-провайдер, который выдает данные справочника
        Загрузчик дилеров
    */
    this.loadItems = function(queryParams) {
        var self = this;
        return loadDirectories().then(function(directories) {
            return userApi.query(queryParams).then(function(itemsData) {
                _.extend(directories, {dealers: dealersLoader.makeCollection(takeDealers(itemsData), queryParams, directories)});
                return _.extend(directories, {users: self.makeCollection(itemsData, queryParams, directories)});
            });
        });
    };

    /*
    Метод загрузки элемента справочника с дополнительными справочниками
    Входы:
        Идентификатор элемента справочника
    Выходы:
        Промис: объект, свойства которого - элемент с разрешенными ссылками, а также справочники
    Необходимые зависимости:
        Дата-провайдер, который выдает данные справочника
    */
    this.loadItem = function(id) {
        var self = this;
        return loadDirectories().then(function(directories) {
            return userApi.get(id).then(function(itemData) {
                if (itemData.dealer) {
                    _.extend(directories, {dealer: new Dealer(dealersLoader.makeItem.call(itemData.dealer, directories))});
                }
                return _.extend(directories, {user: new User(self.makeItem.call(itemData, directories))});
            });
        });
    };
});