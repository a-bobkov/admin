
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, Collection, Item) {
    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, Collection, Item, 100);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, Collection, Item, multiplyUsersCoef) {
    var _statuses = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Status = function () {};
    angular.extend(_Status.prototype, Item.prototype);
    _statuses._registerCollection('_status', '_statuses', _Status, undefined);

    var _groups = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Group = function () {};
    angular.extend(_Group.prototype, Item.prototype);
    _groups._registerCollection('_group', '_groups', _Group, undefined);

    var _managers = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Manager = function () {};
    angular.extend(_Manager.prototype, Item.prototype);
    _managers._registerCollection('_manager', '_managers', _Manager, undefined);

    var _cities = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _City = function () {};
    angular.extend(_City.prototype, Item.prototype);
    _cities._registerCollection('_city', '_cities', _City, undefined);

    var _markets = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Market = function () {};
    angular.extend(_Market.prototype, Item.prototype);
    _markets._registerCollection('_market', '_markets', _Market, undefined);

    var _metros = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Metro = function () {};
    angular.extend(_Metro.prototype, Item.prototype);
    _metros._registerCollection('_metro', '_metros', _Metro, undefined);

    var _sites = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Site = function () {};
    angular.extend(_Site.prototype, Item.prototype);
    _sites._registerCollection('_site', '_sites', _Site, undefined);

    var _dealers = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _Dealer = function () {};
    angular.extend(_Dealer.prototype, Item.prototype);
    _dealers._registerCollection('_dealer', '_dealers', _Dealer, undefined);

    var _users = (function() {
        var Child = inheritCollection(function() {}, Collection);
        return new Child;
    }());
    var _User = function () {};
    angular.extend(_User.prototype, Item.prototype);
    _User.prototype.isDealer = function() {
        return (this._group && this._group.id == 2);
    }
    _User.prototype.isSite = function() {
        return (this._group && this._group.id == 3);
    }
    _users._registerCollection('_user', '_users', _User, undefined);

    var addPrefix = function(dataObj) {
        var newData;
        if (angular.isArray(dataObj)) {
            newData = [];
            angular.forEach (dataObj, function(value, idx) {
                if (angular.isObject(value)) {
                    newData[idx] = addPrefix(value);
                } else {
                    newData[idx] = value;
                }
            });
        } else {
            newData = {};
            angular.forEach (dataObj, function(value, key) {
                if (angular.isObject(value)) {
                    newData['_' + key] = addPrefix(value);
                } else {
                    newData[key] = value;
                }
            })
        }
        return newData;
    }

    var subPrefix = function(dataObj) {
        var newData;
        if (angular.isArray(dataObj)) {
            newData = [];
            angular.forEach (dataObj, function(value, idx) {
                if (angular.isObject(value)) {
                    newData[idx] = subPrefix(value);
                } else {
                    newData[idx] = value;
                }
            });
        } else {
            newData = {};
            angular.forEach (dataObj, function(value, key) {
                if ((angular.isObject(value)) && (key.indexOf('_') === 0)) {
                    newData[key.substring(1)] = subPrefix(value);
                } else {
                    newData[key] = value;
                }
            })
        }
        return newData;
    }

    var usersPartialData = function(usersData) {
        return _.invoke(usersData, function() {
            var obj = {
                    id: this.id,
                    email: this.email,
                    status: this._status,
                    group: this._group,
                    last_login: this.last_login
                };
            if (this.isDealer()) {
                obj.dealer = {
                    id: this._dealer.id,
                    company_name: this._dealer.company_name,
                    manager: this._dealer._manager
                };
            } else if (this.isSite()) {
                obj.site = {id: this._site.id};
            }
            return obj;
        });
    }

    var regexQuery = /^\/api2\/users\/partial$/;
    $httpBackend.whenGET(regexQuery).respond(function(method, url, data) {
        return [200, {
            status: 'success',
            data: {
                users: usersPartialData(usersData)
            }
        }];
    });

    var regexGet = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexGet).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexGet,'$1'));
        var user = _.find(usersData, {id: id});
        if (user) {
            return [200, {
                status: 'success',
                data: {
                    user: subPrefix(user)
                }
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Пользователь не найден'
            }];
        }
    });

    var regexDirectories = /^\/api2\/combined\/users$/;
    $httpBackend.whenGET(regexDirectories).respond(function(method, url, data) {
        return [200, {
            status: 'success',
            data: subPrefix(directoriesData)
        }];
    });

    var regexPost = /^\/api2\/users\/$/;
    $httpBackend.whenPOST(regexPost).respond(function(method, url, data) {
        var dataObj = addPrefix(angular.fromJson(data));
        var respond;
        var errorMessages = [];

        var user = new _User;
        if (dataObj._dealer) {
            var dealer = new _Dealer;
            respond = dealer._fillItem(dataObj._dealer);
            errorMessages = _.union(errorMessages, respond.errorMessages);
            dealer.id = 1 + _.max(usersData, function(item) {
                return !item._dealer || item._dealer.id;
            }).id;
            delete dataObj._dealer;
            user._dealer = dealer;
        }

        respond = user._fillItem(dataObj);
        errorMessages = _.union(errorMessages, respond.errorMessages);
        user.id = 1 + _.max(usersData, function(item) {
            return item.id;
        }).id;

        if (errorMessages.length) {
            return [400, {
                status: 'error',
                message: 'Ошибка при создании',
                errors: errorMessages
            }];
        }
        // todo: проверять данные в соответствии с форматом полей таблиц и требованиями ссылочной целостности
        usersData.push(user);
        return [200, {
            status: 'success',
            data: {
                user: subPrefix(user)
            }
        }];
    });

    var regexPut = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexPut).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexPut,'$1'));
        var userIdx = _.findIndex(usersData, {id: id});
        if (userIdx !== -1) {
            var dataObj = addPrefix(angular.fromJson(data));
            var respond;
            var errorMessages;
            var dealer = new _Dealer;
            respond = dealer._fillItem(dataObj._dealer);
            errorMessages = _.union(errorMessages, respond.errorMessages);
            if (!dealer.id) {
                dealer.id = 1 + _.max(usersData, function(item) {
                    return !item._dealer || item._dealer.id;
                }).id;
            }
            delete dataObj._dealer;

            var user = new _User;
            respond = user._fillItem(dataObj);
            errorMessages = _.union(errorMessages, respond.errorMessages);
            user._dealer = dealer;

            if (errorMessages.length) {
                return [400, {
                    status: 'error',
                    message: 'Ошибка при обновлении',
                    errors: errorMessages
                }];
            }
            usersData[userIdx] = user;
            return [200, {
                status: 'success',
                data: {
                    user: subPrefix(user)
                }
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Пользователь не найден'
            }];
        }
    });

    var regexDelete = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDelete).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexDelete,'$1'));
        var userIdx = _.findIndex(usersData, {id: id});
        if (userIdx !== -1) {
            usersData.splice(userIdx, 1);
            return [200, {
                status: 'success',
                data: null
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Пользователь не найден'
            }];
        }
    });

    _statuses._setAll([
        { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
        { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
        { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
    ]);
    var directoriesData = {
        _groups: _groups._setAll(addPrefix([
            {id: 3, name: 'Автосайт'},
            {id: 2, name: 'Автосалон'},
            {id: 1, name: 'Администратор'}
        ])),
        _managers: _managers._setAll(addPrefix([
            {id: 1, name: 'Катя'},
            {id: 2, name: 'Инна'},
            {id: 4, name: 'Потеряшки'},
            {id: 0, name: ''}
        ])),
        _cities: _cities._setAll(addPrefix([
            {id: 5, name: 'Питер'},
            {id: 6, name: 'Москва'}
        ])),
        _markets: _markets._setAll(addPrefix([
            {id: 6, name: 'Рынок один в москве', city: {id: 6}},
            {id: 7, name: 'Рынок два в москве', city: {id: 6}},
            {id: 8, name: 'Рынок один в питере', city: {id: 5}},
            {id: 9, name: 'Рынок два в питере', city: {id: 5}}
        ])),
        _metros: _metros._setAll(addPrefix([
            {id: 8, name: 'Метро один в москве', city: {id: 6}},
            {id: 9, name: 'Метро два в москве', city: {id: 6}},
            {id: 10, name: 'Метро один в питере', city: {id: 5}},
            {id: 11, name: 'Метро два в питере', city: {id: 5}}
        ])),
        _sites: _sites._setAll(addPrefix([
            {id: 11, name: 'Сайт один'},
            {id: 12, name: 'Сайт два'}
        ]))
    };

    var usersData = _users._setAll(multiplyUsers(addPrefix([
        {
            id: 5,
            email: 'demo@maxposter.ru',
            last_login: '2013-12-01',
            status: {id: 'active'},
            group: {id: 2},
            dealer: {
                id: 5,
                company_name: 'Демокомпания',
                city: {id: 5},
                market: {id: 8},
                metro: {id: 10},
                adress: '191040, Лиговский проспект, 150, оф.505',
                fax: '+7(812)232-4123',
                dealer_email: 'demo@demo.ru',
                site: 'http://www.w3schools.com',
                contact_name: 'Аверин Константин Петрович',
                phone: '+7(812)232-4123',
                phone_from: 10,
                phone_to: 20,
                phone2: '+7(812)232-4124',
                phone2_from: 11,
                phone2_to: 21,
                phone3: '+7(812)232-4125',
                phone3_from: 7,
                phone3_to: 15,
                company_info: 'Здесь может быть произвольный текст...',
                manager: {id: 1}
            },
            site: {id: 11}
        },
        {id: 1, email: 'a-bobkov@ab.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 1, company_name: 'Ещё одна компания', manager: {id: 2}}},
        {id: 2, email: 'a-bobkov@abb.com', last_login: '2011-03-11', status: {id: 'active'}, group: {id: 3}, site: {id: 11}},
        {id: 3, email: 'a-bobkov@abc.com', last_login: '2012-05-31', status: {id: 'inactive'}, group: {id: 2}, dealer: {
            id: 3, company_name: 'Другая компания', manager: {id: 1}}},
        {id: 4, email: 'a-bobkov@abd.com', last_login: '2011-12-12', status: {id: 'blocked'}, group: {id: 3}, site: {id: 12}},
        {id: 6, email: 'a-bobkov@abe.com', last_login: '2013-01-06', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 6, company_name: 'Крутая компания', manager: {id: 2}}},
        {id: 7, email: 'a-bobkov@abf.com', last_login: '2000-01-12', status: {id: 'inactive'}, group: {id: 2}, dealer: {
            id: 7, company_name: 'Супер-салон', manager: {id: 2}}},
        {id: 8, email: 'a-bobkov@abg.com', last_login: '2000-08-07', status: {id: 'active'}, group: {id: 1}},
        {id: 9, email: 'a-bobkov@abh.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 9, company_name: 'Битые корыта', manager: {id: 1}}},
        {id: 10, email: 'a-bobkov@abi.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 10, company_name: 'Два в одном', manager: {id: 2}}},
        {id: 11, email: 'a-bobkov@abj.com', last_login: '2012-01-01', status: {id: 'blocked'}, group: {id: 3}, site: {id: 11}},
        {id: 12, email: 'a-bobkov@abk.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 12, company_name: 'Авто-мото', manager: {id: 0}}},
        {id: 13, email: 'a-bobkov@abl.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 2}, dealer: {
            id: 13, company_name: 'Свет', manager: {id: 4}}},
        {id: 14, email: 'a-bobkov@abo.com', last_login: '2012-01-01', status: {id: 'blocked'}, group: {id: 3}, site: {id: 12}},
        {id: 15, email: 'a-bobkov@abm.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 3}, site: {id: 11}}
    ])));

    function multiplyUsers(arr) {
        multiplyUsersCoef = multiplyUsersCoef || 1;
        var multiplyArray = [];

        var cloneArr = function(arr, num) {
            return angular.forEach(angular.copy(arr), function(value) {
                var id = value.id + num * arr.length;
                value.id = id;
                value.email = num + value.email;
                if (value._dealer) {
                    value._dealer.id = id;
                }
                multiplyArray.push(value);
            });
        }
        for (var i = 0; i < multiplyUsersCoef; i++) {
            multiplyArray = _.union(multiplyArray, cloneArr(arr, i));
        }
        return multiplyArray;
    }
};
