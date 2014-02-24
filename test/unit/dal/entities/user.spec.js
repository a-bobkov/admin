'use strict';

describe('Сервисы users и userApi', function() {
    var $rootScope,
        $q,
        $log,
        users,
        User,
        userApi,
        Api;


    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$rootScope_, _$q_, _$log_, _users_, _User_, _userApi_, _Api_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            $log = _$log_;
            users = _users_;
            User = _User_;
            userApi = _userApi_;
            Api = _Api_;
        });
    });

    describe('Сервис userApi должен', function() {

        it('query() - вызывать Api и возвращать полученные данные без секции users', function() {
            var dataUsers = [
                    { id: 1, name: 'имя пользователя' },
                    { id: 3, name: 'имя другого пользователя' }
                ],
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when({
                users: dataUsers
            }));

            userApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(Api.get).toHaveBeenCalledWith("/users/partial");
            expect(actualSuccess).toBe(dataUsers);
        });

        it('query() - возвращать сообщение об ошибке, если полученные данные - не массив', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when({
                users: data
            }));

            userApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит массив в секции users');
        });

        it('query() - возвращать сообщение об ошибке при отсутствии секции users', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when(data));

            userApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит секции users');
        });

        it('query() - возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.reject(data));

            userApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });

        it('getDirectories() - вызывать Api и возвращать полученные данные', function() {
            var directoriesData = {
                    groups: [
                        {id: 1, name: 'Роль один'},
                        {id: 2, name: 'Роль два'}
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
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when(directoriesData));

            userApi.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(Api.get).toHaveBeenCalledWith('/combined/users');
            expect(actualSuccess).toBe(directoriesData);
        });
    });

    describe('Сервис users должен', function() {

        it('каждый раз обращаться к серверу за элементом коллекции при запросе по id', function() {
            var usersData = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                userData = { id: 1, name: 'Первый', ext: 'Атрибут' },
                actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(usersData));
            spyOn(userApi, 'get').andReturn($q.when(userData));

            users.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            users.get(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(userApi.get).toHaveBeenCalledWith(1);
            expect(actualSuccess).toEqualData(userData);
        });

        it('загружать опции с сервера', function() {
            var directoriesData = {
                    groups: [
                        {id: 1, name: 'Роль один'},
                        {id: 2, name: 'Роль два'}
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
                },
                actualSuccess,
                actualError;

            spyOn(userApi, 'getDirectories').andReturn($q.when(directoriesData));

            users.getDirectories().then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
            $rootScope.$digest();

            expect(userApi.getDirectories).toHaveBeenCalledWith();
            expect(actualSuccess.markets[0].city).toBe(actualSuccess.cities[1]);
            expect(actualSuccess.markets[1].city).toBe(actualSuccess.cities[0]);
            expect(actualSuccess.metros[0].city).toBe(actualSuccess.cities[0]);
            expect(actualSuccess.metros[1].city).toBe(actualSuccess.cities[1]);
        });

        it('загружать пользователей после опций', function() {
            var directoriesData = {
                    groups: [
                        {id: 1, name: 'Роль один'},
                        {id: 2, name: 'Роль два'}
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
                },
                usersData = [
                    { id: 1, name: 'имя пользователя', city: {id: 5}, market: {id: 8} }
                ],
                actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(usersData));
            spyOn(userApi, 'getDirectories').andReturn($q.when(directoriesData));

            users.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            var city = actualSuccess.cities[0];
            var market = actualSuccess.markets[1];

            users.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            var user = actualSuccess[0];

            expect(user.city).toBe(city);
            expect(user.market).toBe(market);
        });

        it('проверять корректность ответа при загрузке опций с сервера и выдавать полный список ошибок', function() {
            var directoriesData = {
                    groups:
                        {id: 1, name: 'Роль один'},
                    managers: [
                        {name: 'Менеджер один'},
                        {id: 4, name: 'Менеджер два'}
                    ],
                    cities: [
                        {id: 5, name: 'Город один'},
                        {id: 6, name: 'Город два'}
                    ],
                    markets: [
                        {id: 7, name: 'Рынок один', city: {id: 5}},
                        {id: 8, name: 'Рынок два', city: {ident: 6}}
                    ],
                    metros: [
                        {id: 9, name: 'Метро один', city: {id: 55}},
                        {id: 10, name: 'Метро два', city: {id: 6}}
                    ],
                    roles: [
                        {id: 11, name: 'Сайт один'},
                        {id: 12, name: 'Сайт два'}
                    ]
                },
                actualSuccess,
                actualError;


            spyOn(userApi, 'getDirectories').andReturn($q.when(directoriesData));
            spyOn($log, 'error').andReturn(null);

            users.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect($log.error).toHaveBeenCalledWith([ 
                { message: 'Отсутствует массив в данных: {"id":1,"name":"Роль один"}' }, 
                { message: 'Нет параметра id в элементе: {"name":"Менеджер один"}' }, 
                { message: 'Не найдена ссылка для элемента {"id":55}' }, 
                { message: 'Неизвестная секция: roles' } 
            ]);
        });

        it('при сохранении без id - передавать в $http объект со ссылками в форме {id: ??}, кроме dealer', function() {
            var userData = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newUserData = {
                    name: 'Другой',
                    ext: 'Extra',
                    user: {id: 2},
                    dealer: {id: 3, name: 'Дилер'}
                },
                newUser = {
                    id: 4,
                    name: 'Другой',
                    ext: 'Extra',
                    user: {id: 2},
                    dealer: {id: 3}
                },
                actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(userData));
            spyOn(userApi, 'create').andReturn($q.when(newUser));

            users.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            var newItem = new User();
            newItem._fillItem(newUserData);
            users.save(newItem).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(userApi.create).toHaveBeenCalled();
            expect(userApi.create).toHaveBeenCalledWith(newUserData);
        });
    });
});