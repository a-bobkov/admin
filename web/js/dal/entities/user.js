'use strict';

angular.module('max.dal.entities.user', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.group',
    'max.dal.entities.site',
    'max.dal.entities.dealer',
    'max.dal.entities.manager',
    'max.dal.entities.city',
    'max.dal.entities.market',
    'max.dal.entities.metro'
])

.factory('userApi', function(RestApi, Api) {

    var userApi = new RestApi('users', 'user');

    userApi.getDirectories = function() {
        return Api.get('/combined/users');
    };

    return userApi;
})

.factory('User', function(userApi, Item, Dealer) {

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
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (key === 'dealer' && value) {
                newValue = new Dealer(value, directories);
            } else if (value && value.id) {    // ссылка
                if (key === 'group') {
                    newValue = directories.groups.get(value.id);
                } else if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else if (key === 'manager') {
                    newValue = directories.managers.get(value.id);
                } else if (key === 'city') {
                    newValue = directories.cities.get(value.id);
                } else if (key === 'market') {
                    newValue = directories.markets.get(value.id);
                } else if (key === 'metro') {
                    newValue = directories.metros.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else if (key === 'status') {
                newValue = directories.userstatuses.get(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(User.prototype, Item.prototype);

    User.prototype.isDealer = function() {
        return (this.group && this.group.id == 2);
    };

    User.prototype.isSite = function() {
        return (this.group && this.group.id == 3);
    };

    User.prototype.serialize = function() {
        var itemData = {};
        _.forOwn(this, function(value, key) {
            if (key === 'status' ) {
                itemData[key] = value.id;
            } else if (key === "dealer" && value) {
                itemData[key] = value.serialize();
            } else if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        if (!this.isDealer()) {
            itemData.dealer = null;
        };
        if (!this.isSite()) {
            itemData.site = null;
        }
        if (this.isDealer()) {
            itemData.dealer.id = itemData.id;
        };
        return itemData;
    };

    User.prototype.save = function(directories) {
        if (this.id) {
            return userApi.update(this.serialize()).then(function(respond) {
                return new User(respond.user, directories);
            });
        } else {
            return userApi.create(this.serialize()).then(function(respond) {
                return new User(respond.user, directories);
            });
        }
    };

    User.prototype.remove = function() {
        if (this.id) {
            return userApi.remove(this.id);
        }
        throw new CollectionError('Попытка удалить элемент без id');
    };

    return User;
})

.factory('Users', function(Collection) {
    var Users = (function() {
        var Users = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Users.prototype, Collection.prototype);
        return Users;
    }());
    return Users;
})

.service('usersLoader', function(userApi, User, Users, 
    userStatusesLoader, groupsLoader, sitesLoader, managersLoader, citiesLoader, marketsLoader, metrosLoader) {

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
    Метод создания коллекций дополнительных справочников
    Входы:
        Массив данных, полученных от дата-провайдера
    Выходы:
        Промис: объект, свойства которого - коллекции со ссылками, разрешенными по предыдущим коллекциям
    Необходимые зависимости:
        Загрузчики справочников, которые могут встретиться в ответе
    */
    this.makeDirectories = function(directoriesData) {
        var directories = {};
        _.forOwn(directoriesData, function(itemsData, key) {
            if (key === 'groups') {
                directories[key] = groupsLoader.makeCollection(itemsData, null, directories);
            } else if (key === 'managers') {
                directories[key] = managersLoader.makeCollection(itemsData, null, directories);
            } else if (key === 'cities') {
                directories[key] = citiesLoader.makeCollection(itemsData, null, directories);
            } else if (key === 'markets') {
                directories[key] = marketsLoader.makeCollection(itemsData, null, directories);
            } else if (key === 'metros') {
                directories[key] = metrosLoader.makeCollection(itemsData, null, directories);
            } else if (key === 'sites') {
                directories[key] = sitesLoader.makeCollection(itemsData, null, directories);
            }
        });
        directories.userstatuses = userStatusesLoader.makeCollection([
            { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
            { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
            { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
        ]);
        return directories;
    };

    /*
    Метод загрузки дополнительных справочников
    Входы:
        Нет
    Выходы:
        Промис: объект, свойства которого - коллекции со ссылками, разрешенными по предыдущим коллекциям
    Необходимые зависимости:
        Дата-провайдер, который выдает данные справочников
    */
    this.loadDirectories = function() {
        var self = this;
        return userApi.getDirectories().then(function(directoriesData) {
            return self.makeDirectories(directoriesData);
        });
    };

    /*
    Метод загрузки списка элементов с дополнительными справочниками
    Входы:
        Параметры запроса данных
        Справочники для разрешения ссылок - опционально
    Выходы:
        Промис: объект, свойства которого - коллекции с разрешенными ссылками
    Необходимые зависимости:
        Дата-провайдер, который выдает данные справочника
    */
    this.loadItems = function(queryParams, directories) {
        var self = this;
        return userApi.query(queryParams).then(function(respond) {
            if (!directories) {
                return self.loadDirectories().then(function(directories) {
                    return _.extend(directories, {users: self.makeCollection(respond.users, respond.params, directories)});
                });
            } else {
                return _.extend(directories, {users: self.makeCollection(respond.users, respond.params, directories)});
            }
        });
    };

    /*
    Метод загрузки элемента с дополнительными справочниками
    Входы:
        Идентификатор элемента
    Выходы:
        Промис: объект, свойства которого - элемент с разрешенными ссылками, а также справочники
    Необходимые зависимости:
        Дата-провайдер, который выдает данные элемента
        Конструктор пользователей
    */
    this.loadItem = function(id) {
        var self = this;
        return this.loadDirectories().then(function(directories) {
            return userApi.get(id).then(function(respond) {
                return _.extend(directories, {user: new User(respond.user, directories)});
            });
        });
    };
})

.factory('UserStatus', function(Item) {

    var UserStatus = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(UserStatus.prototype, Item.prototype);
    return UserStatus;
})

.factory('UserStatuses', function(Collection) {
    var UserStatuses = (function() {
        var UserStatuses = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(UserStatuses.prototype, Collection.prototype);
        return UserStatuses;
    }());
    return UserStatuses;
})

.service('userStatusesLoader', function(UserStatus, UserStatuses) {

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