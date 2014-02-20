'use strict';

describe('http-mock', function() {
    var $httpBackend,
        $http,
        $rootScope,
        users,
        User;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$httpBackend_, _$http_, _$rootScope_, _users_, _User_) {
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $rootScope = _$rootScope_;
            users = _users_;
            User = _User_;
        });
    });

    beforeEach(function() {
        /**
         * мини-сервер http для комплексных тестов
         */
        var usersData = [
                {
                    id: 5,
                    email: 'demo@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
                    dealer: {
                        id: 5,
                        company_name: 'Демокомпания',
                        city: {id: 5},
                        market: {id: 8},
                        metro: {id: 10},
                        adress: '191040, Лиговский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        dealer_email: 'demo@demo.ru',
                        site: 'http://www.w3schools.com',
                        contact_name: 'Аверин Константин Петрович',
                        phone: '+7-812-232-4123',
                        phone_from: '10',
                        phone_to: '20',
                        phone2: '+7-812-232-4124',
                        phone2_from: '11',
                        phone2_to: '21',
                        phone3: '+7-812-232-4125',
                        phone3_from: '7',
                        phone3_to: '15',
                        company_info: 'Здесь может быть произвольный текст...',
                        manager: {id: 3}
                    },
                    site: {id: 11}
                },
                {id: 1, email: 'a-bobkov@ab.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 1, company_name: 'Ещё одна компания', manager: {id: 4}}},
                {id: 2, email: 'a-bobkov@abb.com', last_login: '2011-03-11', status: {id: 'active'}, group: {id: 2}, site: {id: 11}},
                {id: 3, email: 'a-bobkov@abc.com', last_login: '2012-05-31', status: {id: 'inactive'}, group: {id: 1}, dealer: {
                    id: 3, company_name: 'Другая компания', manager: {id: 3}}},
                {id: 4, email: 'a-bobkov@abd.com', last_login: '2011-12-12', status: {id: 'error'}, group: {id: 2}, site: {id: 12}},
                {id: 6, email: 'a-bobkov@abe.com', last_login: '2013-01-06', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 6, company_name: 'Крутая компания', manager: {id: 4}}},
                {id: 7, email: 'a-bobkov@abf.com', last_login: '2000-01-12', status: {id: 'inactive'}, group: {id: 1}, dealer: {
                    id: 7, company_name: 'Супер-салон', manager: {id: 4}}},
                {id: 8, email: 'a-bobkov@abg.com', last_login: '2000-08-07', status: {id: 'active'}, group: {id: 0}},
                {id: 9, email: 'a-bobkov@abh.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 9, company_name: 'Битые корыта', manager: {id: 3}}},
                {id: 10, email: 'a-bobkov@abi.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 10, company_name: 'Два в одном', manager: {id: 4}}},
                {id: 11, email: 'a-bobkov@abj.com', last_login: '2012-01-01', status: {id: 'blocked'}, group: {id: 2}, site: {id: 11}},
                {id: 12, email: 'a-bobkov@abk.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 12, company_name: 'Авто-мото', manager: {id: 3}}},
                {id: 13, email: 'a-bobkov@abl.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 1}, dealer: {
                    id: 13, company_name: 'Свет', manager: {id: 4}}},
                {id: 14, email: 'a-bobkov@abo.com', last_login: '2012-01-01', status: {id: 'blocked'}, group: {id: 2}, site: {id: 12}},
                {id: 15, email: 'a-bobkov@abm.com', last_login: '2012-01-01', status: {id: 'active'}, group: {id: 4}, site: {id: 11}}
            ],
            directoriesData = {
                groups: [
                    {id: 1, name: 'Автосалон'},
                    {id: 2, name: 'Автосайт'}
                ],
                managers: [
                    {id: 3, name: 'Менеджер один'},
                    {id: 4, name: 'Менеджер два'}
                ],
                cities: [
                    {id: 5, name: 'Город один'},
                    {id: 6, name: 'Город два'}
                ],
                markets: [
                    {id: 7, name: 'Рынок один', city: {id: 6}},
                    {id: 8, name: 'Рынок два', city: {id: 5}}
                ],
                metros: [
                    {id: 9, name: 'Метро один', city: {id: 5}},
                    {id: 10, name: 'Метро два', city: {id: 6}}
                ],
                sites: [
                    {id: 11, name: 'Сайт один'},
                    {id: 12, name: 'Сайт два'}
                ]
            };

        var usersPartialData = function(usersData) {
            return _.invoke(usersData, function() {
                var obj = {
                        id: this.id,
                        email: this.email,
                        status: this.status,
                        group: this.group,
                        last_login: this.last_login
                    };
                if (this.group.id === 1) {          // автосалон
                    obj.dealer = {
                        id: this.dealer.id,
                        company_name: this.dealer.company_name,
                        manager: this.dealer.manager
                    };
                } else if (this.group.id === 2) {   // автосайт
                    obj.site = {id: this.site.id};
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
            if (typeof user === 'object') {
                return [200, {
                    status: 'success',
                    data: {
                        user: user
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
                data: directoriesData
            }];
        });

        var regexPost = /^\/api2\/users\/$/;
        $httpBackend.whenPOST(regexPost).respond(function(method, url, data) {
            var user = new User;
            user._fillItem(angular.fromJson(data));
            user.id = 1 + _.max(usersData, function(item) {
                return item.id;
            }).id;
            if (user.group.id == 1) {      // каждый раз создаем нового дилера
                user.dealer = user.dealer || {};
                user.dealer.id = 1 + _.max(usersData, function(item) {
                    return !item.dealer || item.dealer.id;
                }).id;
            }
            // todo: проверять данные в соответствии с форматом полей таблиц и требованиями ссылочной целостности
            usersData.push(user);
            return [200, {
                status: 'success',
                data: {
                    user: user
                }
            }];
        });
    });

    describe('Метод post()', function() {
        it('сохранять данные нового пользователя', function() {
        var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
                    dealer: {
                        company_name: 'Новая компания',
                        city: {id: 5},
                        market: {id: 8},
                        metro: {id: 10},
                        adress: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        dealer_email: 'demo@demo.ru',
                        site: 'http://www.w3schools.com',
                        contact_name: 'Аверин Константин Петрович',
                        phone: '+7-812-232-4123',
                        phone_from: '10',
                        phone_to: '20',
                        phone2: '+7-812-232-4124',
                        phone2_from: '11',
                        phone2_to: '21',
                        phone3: '+7-812-232-4125',
                        phone3_from: '7',
                        phone3_to: '15',
                        company_info: 'Здесь может быть произвольный текст...',
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            var user = new User();
            user._fillItem(data);

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            var savedUser = actualSuccess;

            users.get(savedUser.id).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(savedUser.id).toBeDefined();
            expect(savedUser.dealer.id).toBeDefined();
            delete savedUser.id;
            delete savedUser.dealer.id;
            expect(savedUser).toEqualData(user);
        });
    });

    describe('Метод get()', function() {
        it('возвращать данные пользователя', function() {
        var actualSuccess,
            actualError;

            users.get(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            expect(actualSuccess.dealer.contact_name).toEqual('Аверин Константин Петрович');
        });

        it('возвращать ошибку, если пользователь не найден', function() {
        var actualSuccess,
            actualError;

            users.get(999).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.errorMessage).toEqual('В коллекции не найден элемент с id: 999');
        });

        it('загружать опции с сервера после пользователей', function() {
        var actualSuccess,
            actualError;

            users.get(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var user = actualSuccess;

            users.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(user.dealer.city).toBe(actualSuccess.cities[0]);
            expect(user.dealer.market).toBe(actualSuccess.markets[1]);
        });
    });
});

