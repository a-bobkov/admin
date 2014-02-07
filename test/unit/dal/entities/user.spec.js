'use strict';

describe('Сервис users из модуля app.dal.entities.user', function() {
    var $rootScope,
        $q,
        users,
        User,
        userApi,
        UserOptions,
        Api;


    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$rootScope_, _$q_, _users_, _User_, _userApi_, _UserOptions_, _Api_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            users = _users_;
            User = _User_;
            userApi = _userApi_;
            UserOptions = _UserOptions_;
            Api = _Api_;
        });
    });

    beforeEach(function() {
        var actual,
            url = '/api2/combined/users/',
            expected = {
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
            };

        spyOn(Api, 'get').andReturn($q.when(
            expected
        ));

        UserOptions.getOptions().then(function(respond) {
            actual = respond;
        });

        $rootScope.$digest();
    });

    describe('должен знать провайдера REST API, для чего', function() {

        it('должен иметь заданный на этапе инициализации провайдер REST API', function() {
            expect(users.getRestApiProvider()).toBe(userApi);
        });

        it('должен запоминать провайдера', function() {
            var restApiProvider = function () {};
            users.setRestApiProvider(restApiProvider);

            expect(users.getRestApiProvider()).toBe(restApiProvider);
        });

        it('должен выбрасывать эксепшин при попытке получить провайдера, если он не задан', function() {
            delete users.restApiProvider;
            expect( function() { users.getRestApiProvider(); } )
                .toThrow('Не задан провайдер REST API.');
        })
    });

    describe('должен знать функцию-конструктор для элементов коллекции, для чего', function() {

        it('должен иметь заданный на этапе инициализации конструктор User', function() {
            expect(users.getItemConstructor()).toBe(User);
        });

        it('должен выбрасывать эксепшин при попытке получить незaданный конструктор', function() {
            delete users.ItemConstructor;
            expect( function() { users.getItemConstructor(); } )
                .toThrow('Не задан конструктор для элементов коллекции.');
        });

        it('должен уметь запоминать функцию-конструктор', function() {
            var ItemConstructor = function ItemConstructor() {} ;

            users.setItemConstructor(ItemConstructor);
            expect(users.getItemConstructor()).toBe(ItemConstructor);
        });
    });

    describe('хранит коллекцию объектов, для чего умеет', function() {
        beforeEach(function() {
        });

        it('запрашивать данные коллекции с сервера один раз', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            users.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            expect(userApi.query).toHaveBeenCalled();
            expect(userApi.query.calls.length).toEqual(1);
        });

        it('иметь возможность принудительно повторно запрашивать данные', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.getAll();
            $rootScope.$digest();

            users.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(userApi.query).toHaveBeenCalled();
            expect(userApi.query.calls.length).toEqual(2);
        });

        it('создавать коллекцию из полученных данных используя конструктор элементов коллекции', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            _.forEach(actual, function(item) {
                expect(item.constructor).toBe(User);
            });
        });

        it('проверять наличие идентификатора у элементов коллекции', function() {
            var actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    {name: 'Без идентификатора'}
                ]
            ));

            var errorMessages = [];
            users.load().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();

            expect(actualError).toEqualData(['Нет параметра id в элементе: {"name":"Без идентификатора"}']);
        });

        it('возвращать массив объектов', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));
            this.addMatchers({
                toBeArray: function () {
                    return angular.isArray(this.actual);
                }
            });

            users.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBeArray();
        });

        it('возвращать объект коллекции по id', function() {
            var actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(userApi, 'get').andReturn($q.when(
                    {
                        id: 3,
                        name: 'Третий',
                        ext: 'Экстра' 
                    }
            ));

            users.get(3).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualSuccess instanceof User).toBeTruthy();
        });

        it('возвращать индекс объекта коллекции по id', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            var idx = users._findIndex(3);
            expect(users.collection[idx]).toBe(users._findItem(3));
        });
    });

    describe('должен управлять коллекцией объектов, для чего уметь', function() {

        it('возвращать объект с сервера, обновляя данный элемент коллекции', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            var user = users.get(3);
            expect(user.ext).toBeUndefined();

            spyOn(userApi, 'get').andReturn($q.when(
                { id: 3, name: 'Третий', ext: 'Ещё свойство' }
            ));

            users.get(3).then(function(respond) {
                user = respond;
            });
            $rootScope.$digest();

            expect(user.ext).toEqual('Ещё свойство');
        });

        it('выдавать ошибку, если требуемый элемент не найден в коллекции', function() {
            var actualSuccess,
                actualError;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.get(5).then(null, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toEqual('В коллекции не найден элемент с id: 5');
        });

        it('обновлять сохраняемый элемент в коллекции после получения подтверждения от сервера', function() {
            var actual,
                expected = {
                    id: 2,
                    name: 'Другой',
                    ext: 'Extra'
                };

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(userApi, 'update').andReturn($q.when(expected));

            users.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            var user = users._findItem(2);

            users.save(user).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            expect(userApi.update).toHaveBeenCalled()
            expect(actual).toEqualData(expected);
        });

        it('создавать элемент в коллекции после получения подтверждения от сервера', function() {
            var actual,
                expected = {
                    name: 'Другой',
                    ext: 'Extra'
                };

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(userApi, 'create').andReturn($q.when(expected));

            users.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(users.collection.length).toEqual(3);

            var user = new User (expected);

            users.save(user).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            expect(users.collection.length).toEqual(4);
        });

        it('удалять элемент из коллекции после получения подтверждения от сервера', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(userApi, 'remove').andReturn($q.when(null));

            users.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(actual.length).toEqual(3);

            users.remove(2).then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(userApi.remove).toHaveBeenCalled()
            expect(userApi.remove).toHaveBeenCalledWith(2);

            users.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(actual.length).toEqual(2);
        });

        it('выдавать ошибку при удалении элемента, если элемент не найден в коллекции', function() {
            var actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            users.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            users.remove(5).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('В коллекции не найден элемент с id: 5');
        });

        it('Удаление элемента: выдавать ошибку, если сервер вернул строку с ошибкой', function() {
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(userApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(userApi, 'remove').andReturn($q.reject(
                expected
            ));

            users.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            users.remove(1).then(null, function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            expect(actual).toBe(expected);
        });
    });
});

describe('Сервис-конструктор User из модуля app.dal.entities.user умеет', function() {
    var $rootScope,
        $q,
        Api,
        User,
        UserOptions,
        groups,
        managers,
        cities,
        markets,
        metros,
        sites;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$rootScope_, _$q_, _Api_, _User_, _UserOptions_, _groups_, _managers_, _cities_, _markets_, _metros_, _sites_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            Api = _Api_;
            User = _User_;
            UserOptions = _UserOptions_;
            groups = _groups_;
            managers = _managers_;
            cities = _cities_;
            markets = _markets_;
            metros = _metros_;
            sites = _sites_;
        });
    });

    beforeEach(function() {
        var actual,
            url = '/api2/combined/users/',
            expected = {
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
            };

        spyOn(Api, 'get').andReturn($q.when(
            expected
        ));

        UserOptions.getOptions().then(function(respond) {
            actual = respond;
        });

        $rootScope.$digest();
    });

    it('создавать пользователей со ссылками на элементы', function() {
        var group = groups._findItem (1);
        var manager = managers._findItem (3);
        var city = cities._findItem (5);
        var market = markets._findItem (7);
        var metro = metros._findItem (9);
        var site = sites._findItem (11);

        var user = (new User)._fillData({
            id: 11,
            name: 'Один пользователь',
            group: { id: 1},
            manager: { id: 3},
            city: { id: 5},
            market: { id: 7},
            metro: { id: 9},
            site: { id: 11},
        });

        expect(user.group).toBe(group);
        expect(user.manager).toBe(manager);
        expect(user.city).toBe(city);
        expect(user.market).toBe(market);
        expect(user.metro).toBe(metro);
        expect(user.site).toBe(site);
    });

    it('десериализовать пользователя', function() {
        var expected = {
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        }

        var user = (new User)._fillData({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        });

        expect(user).toEqualData(expected);
    });

    it('сериализовать пользователя без вложения элементов по ссылкам', function() {
        var actual,
            expected = {
            id: 1,
            name: 'Первый',
            city: 2
        }

        var user = (new User)._fillData({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        });

        actual = user._serialize();
        expect(actual).toEqualData(expected);
    });

    it('сериализовать пользователя с вложением дилера по ссылке', function() {
        var actual,
            expected = {
            id: 1,
            name: 'Первый',
            dealer: {
                id: 2,
                name: 'Вложенный'
            }
        }

        var user = (new User)._fillData({
            id: 1,
            name: 'Первый',
            dealer: {
                id: 2,
                name: 'Вложенный'
            }
        });

        actual = user._serialize();
        expect(actual).toEqualData(expected);
    });
});

describe('Сервис опций User из модуля app.dal.entities.user умеет', function() {
    var $rootScope,
        $q,
        Api,
        UserOptions;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$rootScope_, _$q_, _Api_, _UserOptions_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            Api = _Api_;
            UserOptions = _UserOptions_;
        });
    });

    it('загружать опции с сервера', function() {
        var actual,
            url = '/api2/combined/users/',
            expected = {
                // roles: [
                //     {id: 1, name: 'Роль один'},
                //     {id: 2, name: 'Роль два'}
                // ],
                // managers: [
                //     {id: 3, name: 'Менеджер один'},
                //     {id: 4, name: 'Менеджер два'}
                // ],
                cities: [
                    {id: 5, name: 'Город один'},
                    {id: 6, name: 'Город два'}
                ],
                markets: [
                    {id: 7, name: 'Рынок один', city: {id: 6}},
                    {id: 8, name: 'Рынок два', city: {id: 5}}
                ]
                // ,
                // metros: [
                //     {id: 9, name: 'Метро один', city: {id: 5}},
                //     {id: 10, name: 'Метро два', city: {id: 6}}
                // ],
                // sites: [
                //     {id: 11, name: 'Сайт один'},
                //     {id: 12, name: 'Сайт два'}
                // ]
            };

        spyOn(Api, 'get').andReturn($q.when(
            expected
        ));

        UserOptions.getOptions().then(function(respond) {
            actual = respond;
        });

        $rootScope.$digest();

        expect(Api.get).toHaveBeenCalledWith(url);
        expect(actual.markets[0].city).toBe(actual.cities[1]);
        expect(actual.markets[1].city).toBe(actual.cities[0]);
    });

    it('проверять корректность ответа при загрузке опций с сервера и выдавать полный список ошибок', function() {
        var actual,
            url = '/api2/combined/users/',
            expected = {
                // roles:
                //     {id: 1, name: 'Роль один'},
                // managers: [
                //     {name: 'Менеджер один'},
                //     {id: 4, name: 'Менеджер два'}
                // ],
                cities: [
                    {id: 5, name: 'Город один'},
                    {id: 6, name: 'Город два'}
                ],
                markets: [
                    {id: 7, name: 'Рынок один', city: {id: 5}},
                    {id: 8, name: 'Рынок два', city: {ident: 6}}
                ]
                // ],
                // metros: [
                //     {id: 9, name: 'Метро один', city: {id: 55}},
                //     {id: 10, name: 'Метро два', city: {id: 6}}
                // ],
                // sites: [
                //     {id: 11, name: 'Сайт один'},
                //     {id: 12, name: 'Сайт два'}
                // ]
            };

        spyOn(Api, 'get').andReturn($q.when(
            expected
        ));

        UserOptions.getOptions().then(null, function(respond) {
            actual = respond;
        });

        $rootScope.$digest();

        expect(actual).toEqual('Ответ сервера содержит ошибки:\n'
            + 'Нет ссылочного id в элементе с id: 8, параметре: city'
        );
    });
});
