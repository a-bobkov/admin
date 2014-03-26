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

    /*
    Проверка и обработка данных элемента, полученных от дата-провайдера
    Входы:
        itemData - объект, полученный от дата-провайдера
        directories - Массив коллекций, по которым разрешаются ссылки
    Выходы:
        Элемент со ссылками, разрешенными по массиву коллекций
    Необходимые зависимости:
        Нет
    */
    var User = function(itemData, directories) {
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value.id) {    // ссылка
                if (key === 'status') {
                    newValue = directories.userstatuses.get(id);
                } else if (key === 'group') {
                    newValue = directories.groups.get(id);
                } else if (key === 'dealer') {
                    newValue = directories.dealers.get(id);
                } else if (key === 'site') {
                    newValue = directories.sites.get(id);
                } else if (key === 'manager') {
                    newValue = directories.managers.get(id);
                } else if (key === 'city') {
                    newValue = directories.cities.get(id);
                } else if (key === 'market') {
                    newValue = directories.markets.get(id);
                } else if (key === 'metro') {
                    newValue = directories.metros.get(id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            // здесь можно реализовать дополнительную проверку и конвертацию данных элемента
            this[key] = newValue;
        });
    };

    User.prototype.isDealer = function() {
        return (this.group && this.group.id == 2);
    };

    User.prototype.isSite = function() {
        return (this.group && this.group.id == 3);
    };

    return User;
})

.factory('Users', function() {
    var Users = (function() {
        var Users = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return Users;
    }());
    return Users;
})

.factory('usersLoader', function(userApi, User, Dealer, Users, 
    userStatusesLoader, groupsLoader, dealersLoader, sitesLoader, managersLoader, citiesLoader, marketsLoader, metrosLoader) {

    /*
    Метод проверки и обработки данных справочника, полученных от дата-провайдера
    Входы:
        Массив данных, полученных от дата-провайдера
        Параметры запроса, полученные от дата-провайдера
        Массив коллекций, по которым разрешаются ссылки
    Выходы:
        Коллекция со ссылками, разрешенными по переданным коллекциям
    Необходимые зависимости:
        Конструктур элемента, конструктор коллекции
    */
    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new User(itemData, directories);
        });
        return new Users(items, queryParams);
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
                }
            });
            directories.userstatuses = userStatusesLoader.makeCollection([
                { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
                { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
                { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
            ]);
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
        Конструктор пользователей
        Конструктор дилеров
    */
    this.loadItem = function(id) {
        var self = this;
        return loadDirectories().then(function(directories) {
            return userApi.get(id).then(function(itemData) {
                if (itemData.dealer) {
                    _.extend(directories, {dealers: [new Dealer(itemData.dealer, directories)]});
                }
                return _.extend(directories, {user: new User(itemData, directories)});
            });
        });
    };
})

.factory('UserStatus', function() {

    var UserStatus = function(itemData, directories) {
        _.extend(this, itemData);
    };
    return UserStatus;
})

.factory('UserStatuses', function() {
    
    var UserStatuses = (function() {
        var UserStatuses = inheritCollection(function(itemsData, queryParams) {
            Collection.prototype.construct(itemsData, queryParams);
        });
        return UserStatuses;
    }());
    return UserStatuses;
})

.factory('userStatusesLoader', function(UserStatus, UserStatuses) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new UserStatus(itemData, directories);
        });
        return new UserStatuses(items, queryParams);
    };
});