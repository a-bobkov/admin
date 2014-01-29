'use strict';

describe('Сервис users из модуля app.dal.entities.user', function() {
    var $rootScope,
        $q,
        users,
        User,
        UserApi;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$rootScope_, _$q_, _users_, _User_, _UserApi_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            users = _users_;
            User = _User_;
            UserApi = _UserApi_;
        });
    });

    describe('должен знать провайдера REST API, для чего', function() {

        it('должен иметь заданный на этапе инициализации провайдер REST API', function() {
            expect(users.getRestApiProvider()).toBe(UserApi);
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
            UserApi.query = function() {
                return [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ];
            }
        });

        it('запрашивать данные коллекции с сервера один раз', function() {
            spyOn(UserApi, 'query');

            users.getAll();
            users.getAll();

            expect(UserApi.query).toHaveBeenCalled();
            expect(UserApi.query.calls.length).toEqual(1);
        });

        it('иметь возможность принудительно повторно запрашивать данные', function() {
            spyOn(UserApi, 'query');

            users.getAll();
            users.load();

            expect(UserApi.query).toHaveBeenCalled();
            expect(UserApi.query.calls.length).toEqual(2);
        });

        it('создавать коллекцию из полученных данных используя конструктор элементов коллекции', function() {
            var items = users.getAll();

            _.forEach(items, function(item) {
                expect(item.constructor).toBe(User);
            });
        });

        it('проверять наличие идентификатора у элементов коллекции', function() {
            UserApi.query = function(param) {
                return [
                    {id: 1, name: 'Первый'},
                    {name: 'Без идентификатора'}
                ];
            };

            expect( function () { users.getAll(); } )
                .toThrow('Элемент коллекции {"name":"Без идентификатора"} не имеет параметра id.');
        });

        it('возвращать коллекцию объектов', function() {
            this.addMatchers({
                toBeArray: function () {
                    return Object.prototype.toString.call( this.actual ) === '[object Array]';
                }
            });

            var expected = users.getAll();
            expect(expected).toBeArray();
        });
    });

    describe('должен управлять коллекцией объектов, для чего уметь', function() {

        beforeEach(function() {
            UserApi.query = function() {
                return [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ];
            }
        });

        it('возвращать объект из коллекции', function() {
            var user = users.get(1);
            expect(user instanceof User).toBeTruthy();
            expect(user.id).toEqual(1);
            expect(user.name).toEqual('Первый');
        });

        it('удалять элемент из коллекции после получения подтверждения от сервера', function() {

            spyOn(UserApi, 'remove').andReturn($q.when(null));

            users.remove(2);

            $rootScope.$digest();

            expect(users.getAll().length).toEqual(2);
            expect(UserApi.remove).toHaveBeenCalled()
            expect(UserApi.remove).toHaveBeenCalledWith(2);
        });

        it('Удаление элемента: выдавать ошибку, если элемент не найден в коллекции', function() {
            var actual;

            actual = users.remove(5);

            expect(actual).toBe('В памяти не найден требуемый элемент 5');
        });

        it('Удаление элемента: выдавать ошибку, если сервер вернул строку с ошибкой', function() {
            var id = 1,
                expected = "Сообщение об ошибке",
                actual;

            spyOn(UserApi, 'remove').andReturn($q.reject(
                expected
            ));

            UserApi.remove(id).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

    });
});

describe('Сервис-конструктор User из модуля app.dal.entities.user умеет', function() {
    var users,
        User,
        UserApi;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_users_, _User_, _UserApi_)  {
            users = _users_;
            User = _User_;
            UserApi = _UserApi_;
        });

        UserApi.query = function() {
            return [
                { id: 1, name: 'Первый' },
                { id: 2, name: 'Второй' },
                { id: 3, name: 'Третий' }
            ];
        }
    });

    it('удалять пользователя из коллекции', function() {

        var user = users.get(2);

        // Fixme: Наверно можно написать лучше?
        spyOn(UserApi, 'remove').andReturn({
            then: function(successCallback) {
                successCallback();
            }
        });

        expect(users.getAll().length).toEqual(3);

        user.remove();

        expect(users.getAll().length).toEqual(2);
    })
});